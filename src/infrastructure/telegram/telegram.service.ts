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
  private readonly enabled: boolean;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken', '');
    this.chatId = this.configService.get<string>('telegram.chatId', '');
    this.enabled = this.configService.get<boolean>('telegram.enabled', false);
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (this.enabled && this.botToken && this.chatId) {
      this.logger.log('Telegram service initialized successfully');
    } else {
      this.logger.warn('Telegram service is not configured or disabled');
    }
  }

  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = this.formatOtpMessage(phoneNumber, code);
    return this.sendMessage(message);
  }

  async sendFormattedMessage(
    phoneNumber: string,
    code: string,
    purpose?: string,
  ): Promise<boolean> {
    const message = this.formatOtpMessage(phoneNumber, code, purpose);
    return this.sendMessage(message);
  }

  async sendMessage(
    message: string,
    extra?: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.enabled || !this.botToken) {
      this.logger.warn(
        `Telegram service not configured. Would send: ${message}`,
      );
      return true;
    }

    if (!this.chatId) {
      this.logger.error('Telegram chat ID not configured');
      return false;
    }

    try {
      const url = `${this.apiUrl}/sendMessage`;

      const response = await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
          ...(extra ?? {}),
        }),
      );

      if (response.data.ok) {
        this.logger.log('OTP sent to Telegram channel successfully');
        return true;
      } else {
        this.logger.error('Telegram API returned error', response.data);
        return false;
      }
    } catch (error) {
      if (error.response) {
        this.logger.error(
          'Failed to send message to Telegram',
          error.response.data,
        );
      } else {
        this.logger.error('Failed to send message to Telegram', error.message);
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
