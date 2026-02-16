import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  SUPPORTED_LOCALES,
  type Locale,
} from '../../common/i18n/translation.util';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ru: 'Russian',
  uz: 'Uzbek',
};

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly openai: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn(
        'OPENAI_API_KEY not set. Translation API will be disabled. Get a key at https://platform.openai.com/api-keys',
      );
    }
  }

  async translate(
    text: string,
    sourceLocale: Locale,
    targetLocales: Locale[],
  ): Promise<Partial<Record<Locale, string>>> {
    const filtered = targetLocales.filter((l) => l !== sourceLocale);
    if (filtered.length === 0) {
      const same: Partial<Record<Locale, string>> = {};
      same[sourceLocale] = text;
      return same;
    }

    if (!this.openai) {
      throw new ServiceUnavailableException(
        'Translation service is not configured. Set OPENAI_API_KEY in environment.',
      );
    }

    const results: Partial<Record<Locale, string>> = {};
    results[sourceLocale] = text;

    const targetList = filtered
      .map((l) => `${LOCALE_NAMES[l]} (${l})`)
      .join(', ');
    const prompt = `You are a professional translator. Translate the following text from ${LOCALE_NAMES[sourceLocale]} into these languages: ${targetList}.

Rules:
- Return ONLY a valid JSON object with keys exactly: ${filtered.map((l) => `"${l}"`).join(', ')}.
- Each value must be the translation as a string. No explanations, no markdown, no code block.
- Preserve tone and meaning. For product titles/descriptions keep them natural in each language.

Text to translate:
${text}

JSON response:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model:
          this.configService.get<string>('TRANSLATION_MODEL') ?? 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : raw;
      const parsed = JSON.parse(jsonStr) as Record<string, string>;

      for (const loc of filtered) {
        const value = parsed[loc];
        if (typeof value === 'string' && value.trim()) {
          results[loc] = value.trim();
        }
      }
    } catch (err) {
      this.logger.error(
        'OpenAI translation failed',
        err instanceof Error ? err.stack : String(err),
      );
      throw new ServiceUnavailableException(
        err instanceof Error ? err.message : 'Translation failed',
      );
    }

    return results;
  }

  async translateToAll(
    text: string,
    sourceLocale: Locale,
  ): Promise<Partial<Record<Locale, string>>> {
    const targets = SUPPORTED_LOCALES.filter((l) => l !== sourceLocale);
    return this.translate(text, sourceLocale, [...targets, sourceLocale]);
  }

  async autoCompleteTranslations(
    translationObject: Partial<Record<Locale, string>> | undefined,
  ): Promise<Partial<Record<Locale, string>>> {
    if (!translationObject || typeof translationObject !== 'object') {
      return translationObject ?? {};
    }

    const sourceLocale = SUPPORTED_LOCALES.find((loc) =>
      translationObject[loc]?.trim(),
    );

    if (!sourceLocale) {
      return translationObject;
    }

    const missingLocales = SUPPORTED_LOCALES.filter(
      (loc) => !translationObject[loc] || translationObject[loc].trim() === '',
    );

    if (missingLocales.length === 0) {
      return translationObject;
    }

    if (!this.openai) {
      this.logger.warn(
        `Translation service unavailable. Returning original translation object without auto-completing missing locales: ${missingLocales.join(', ')}`,
      );
      return translationObject;
    }

    try {
      const sourceText = translationObject[sourceLocale];
      if (!sourceText) {
        return translationObject;
      }
      const translations = await this.translate(
        sourceText,
        sourceLocale,
        missingLocales,
      );

      const { [sourceLocale]: _, ...newTranslations } = translations;

      return {
        ...translationObject,
        ...newTranslations,
      };
    } catch (err) {
      this.logger.warn(
        `Failed to auto-complete translations: ${
          err instanceof Error ? err.message : String(err)
        }. Returning original translation object.`,
      );
      return translationObject;
    }
  }
}
