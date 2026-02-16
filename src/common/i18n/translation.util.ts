export const SUPPORTED_LOCALES = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type TranslationRecord = Partial<Record<Locale, string>>;

const FALLBACK_ORDER: Locale[] = ['en', 'ru', 'uz'];

export function resolveTranslation(
  record: TranslationRecord | null | undefined,
  preferredLocale?: Locale | string | null,
): string | null {
  if (!record || typeof record !== 'object') return null;
  const lang =
    preferredLocale && SUPPORTED_LOCALES.includes(preferredLocale as Locale)
      ? (preferredLocale as Locale)
      : null;
  const order = lang
    ? [lang, ...FALLBACK_ORDER.filter((l) => l !== lang)]
    : FALLBACK_ORDER;
  for (const loc of order) {
    const value = record[loc];
    if (typeof value === 'string' && value.trim()) return value;
  }
  const first = Object.values(record).find(
    (v) => typeof v === 'string' && v.trim(),
  );
  return first != null ? first : null;
}

export function getTranslationForSlug(
  record: TranslationRecord | null | undefined,
): string {
  const resolved = resolveTranslation(record) ?? '';
  return resolved.trim();
}

export function isTranslationRecord(
  value: unknown,
): value is TranslationRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.some((k) => SUPPORTED_LOCALES.includes(k as Locale)) &&
    Object.values(value).every((v) => typeof v === 'string')
  );
}

export function parseAcceptLanguage(header: string | undefined): Locale | null {
  if (!header) return null;
  const parts = header
    .split(',')
    .map((s) => s.trim().split(';')[0].toLowerCase());
  for (const part of parts) {
    const lang = part.slice(0, 2);
    if (lang === 'en') return 'en';
    if (lang === 'ru') return 'ru';
    if (lang === 'uz') return 'uz';
  }
  return null;
}

export function resolveTranslationsInObject(
  value: unknown,
  locale: Locale | null,
): unknown {
  if (value === null || value === undefined) return value;
  if (isTranslationRecord(value)) {
    return resolveTranslation(value, locale) ?? '';
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveTranslationsInObject(item, locale));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = resolveTranslationsInObject(v, locale);
    }
    return out;
  }
  return value;
}
