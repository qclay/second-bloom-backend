import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ITelegramService } from './telegram-service.interface';

@Injectable()
export class TelegramService implements ITelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly topicIdOtp: number | undefined;
  private readonly topicIdModeration: number | undefined;
  private readonly enabled: boolean;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken', '');
    this.chatId = this.configService.get<string>('telegram.chatId', '');
    this.topicIdOtp = this.configService.get<number | undefined>(
      'telegram.topicIdOtp',
      undefined,
    );
    this.topicIdModeration = this.configService.get<number | undefined>(
      'telegram.topicIdModeration',
      undefined,
    );
    this.enabled = this.configService.get<boolean>('telegram.enabled', false);
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (this.enabled && this.botToken && this.chatId) {
      this.logger.log(
        `Telegram initialized: chat_id=${this.chatId}, topic_otp=${this.topicIdOtp ?? 'none'}, topic_moderation=${this.topicIdModeration ?? 'none'}`,
      );
    } else {
      const missing: string[] = [];
      if (!this.botToken) missing.push('TELEGRAM_BOT_TOKEN');
      if (!this.chatId) missing.push('TELEGRAM_CHAT_ID');
      this.logger.warn(
        `Telegram not configured. Add to .env and restart: ${missing.join(', ')}`,
      );
    }
  }

  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = this.formatOtpMessage(phoneNumber, code);
    return this.sendMessage(message, { topic: 'otp' });
  }

  async sendFormattedMessage(
    phoneNumber: string,
    code: string,
    purpose?: string,
  ): Promise<boolean> {
    const message = this.formatOtpMessage(phoneNumber, code, purpose);
    return this.sendMessage(message, { topic: 'otp' });
  }

  async sendMessage(
    message: string,
    extra?: Record<string, unknown> & { topic?: 'otp' | 'moderation' },
  ): Promise<boolean> {
    if (!this.enabled || !this.botToken) {
      this.logger.warn(
        'Telegram not configured. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env, then restart the app.',
      );
      return true;
    }

    if (!this.chatId) {
      this.logger.error('Telegram chat ID not configured');
      return false;
    }

    const { topic, ...rest } = extra ?? {};
    const topicId =
      topic === 'otp'
        ? this.topicIdOtp
        : topic === 'moderation'
          ? this.topicIdModeration
          : undefined;

    try {
      const url = `${this.apiUrl}/sendMessage`;

      const payload: Record<string, unknown> = {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
        ...(topicId != null ? { message_thread_id: topicId } : {}),
        ...rest,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );

      if (response.data.ok) {
        this.logger.log('OTP sent to Telegram channel successfully');
        return true;
      } else {
        this.logger.error('Telegram API returned error', response.data);
        return false;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      if (err.response?.data) {
        this.logger.error(
          'Telegram API error (check bot token, chat_id, and that bot is in the group):',
          err.response.data,
        );
      } else {
        this.logger.error(
          'Failed to send to Telegram:',
          err.message ?? String(error),
        );
      }
      return false;
    }
  }

  async sendMediaGroup(
    photoUrls: string[],
    caption: string,
    options?: { topic?: 'otp' | 'moderation' },
  ): Promise<boolean> {
    if (!this.enabled || !this.botToken) {
      this.logger.warn(
        'Telegram not configured. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env, then restart the app.',
      );
      return true;
    }

    if (!this.chatId) {
      this.logger.error('Telegram chat ID not configured');
      return false;
    }

    if (!photoUrls.length) {
      this.logger.warn('sendMediaGroup: no photo URLs provided');
      return false;
    }

    const { topic } = options ?? {};
    const topicId =
      topic === 'otp'
        ? this.topicIdOtp
        : topic === 'moderation'
          ? this.topicIdModeration
          : undefined;

    const maxCaptionLength = 1024;
    const safeCaption =
      caption.length > maxCaptionLength
        ? caption.slice(0, maxCaptionLength - 3) + '...'
        : caption;

    const media = photoUrls.slice(0, 10).map((url, index) => ({
      type: 'photo' as const,
      media: url,
      parse_mode: 'HTML' as const,
      ...(index === 0 ? { caption: safeCaption } : {}),
    }));

    try {
      const url = `${this.apiUrl}/sendMediaGroup`;
      const payload: Record<string, unknown> = {
        chat_id: this.chatId,
        media,
        ...(topicId != null ? { message_thread_id: topicId } : {}),
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );

      if (response.data?.ok) {
        this.logger.log(`Telegram media group sent (${media.length} photo(s))`);
        return true;
      }
      this.logger.error('Telegram sendMediaGroup API error', response.data);
      return false;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      if (err.response?.data) {
        this.logger.error('Telegram sendMediaGroup error:', err.response.data);
      } else {
        this.logger.error(
          'Failed to send Telegram media group:',
          err.message ?? String(error),
        );
      }
      return false;
    }
  }

  async editMessageText(params: {
    chatId: number | string;
    messageId: number;
    text: string;
    replyMarkup?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.enabled || !this.botToken) {
      this.logger.warn(
        `Telegram service not configured. Would edit message: ${params.text}`,
      );
      return;
    }

    try {
      const url = `${this.apiUrl}/editMessageText`;
      await firstValueFrom(
        this.httpService.post(url, {
          chat_id: params.chatId,
          message_id: params.messageId,
          text: params.text,
          parse_mode: 'HTML',
          ...(params.replyMarkup
            ? { reply_markup: params.replyMarkup }
            : undefined),
        }),
      );
    } catch (error) {
      this.logger.error(
        'Failed to edit Telegram message',
        (error as Error).message,
      );
    }
  }

  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
  ): Promise<void> {
    if (!this.enabled || !this.botToken) {
      return;
    }
    try {
      const url = `${this.apiUrl}/answerCallbackQuery`;
      await firstValueFrom(
        this.httpService.post(url, {
          callback_query_id: callbackQueryId,
          ...(text ? { text } : {}),
        }),
      );
    } catch (error) {
      this.logger.error(
        'Failed to answer Telegram callback query',
        (error as Error).message,
      );
    }
  }

  private formatOtpMessage(
    phoneNumber: string,
    code: string,
    purpose?: string,
  ): string {
    const purposeText = purpose ? ` (${purpose})` : '';

    return `
🔐 <b>New OTP Request${purposeText}</b>

📱 <b>Phone:</b> <code>${phoneNumber}</code>
🔢 <b>Code:</b> <code>${code}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' })}
⏳ <b>Valid for:</b> 5 minutes

<i>This code will expire in 5 minutes.</i>
    `.trim();
  }
}
