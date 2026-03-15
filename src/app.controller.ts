import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { ProductService } from './modules/product/product.service';
import { UserRole } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './infrastructure/telegram/telegram.service';
import { TELEGRAM_MESSAGES } from './common/i18n/telegram.i18n';
import { t, type Locale } from './common/i18n/translation.util';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
  ) {}
  @Get()
  @Public()
  root() {
    return {
      status: 'ok',
      message: 'Second Bloom API',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
      apiPrefix: '/api/v1',
    };
  }

  @Get('health')
  @Public()
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('debug-sentry')
  @Public()
  debugSentry(): never {
    throw new Error(
      'Observability test error – if you see this in Sentry, error tracking works.',
    );
  }

  @Post('telegram/webhook')
  @Public()
  async telegramWebhook(@Body() update: unknown) {
    const body = update as {
      callback_query?: {
        id: string;
        data?: string;
        message?: {
          text?: string;
          chat: { id: number | string };
          message_id: number;
        };
      };
    };
    const callback = body?.callback_query;
    if (!callback) {
      return { ok: true };
    }

    const data: string | undefined = callback.data;
    const message = callback.message;
    const callbackId: string | undefined = callback.id;

    if (!data || !message) {
      if (callbackId) {
        await this.telegramService.answerCallbackQuery(
          callbackId,
          'No data in callback',
        );
      }
      return { ok: true };
    }

    if (!data.startsWith('product:')) {
      if (callbackId) {
        await this.telegramService.answerCallbackQuery(callbackId);
      }
      return { ok: true };
    }

    const [, action, productId] = data.split(':');
    if (!productId || (action !== 'approve' && action !== 'reject')) {
      if (callbackId) {
        await this.telegramService.answerCallbackQuery(
          callbackId,
          'Unknown action',
        );
      }
      return { ok: true };
    }

    const adminUserId = await this.getAdminUserId();
    if (!adminUserId) {
      if (callbackId) {
        await this.telegramService.answerCallbackQuery(
          callbackId,
          'ADMIN_USER_ID is not configured',
        );
      }
      return { ok: true };
    }

    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { language: true },
    });
    const locale = (admin?.language as Locale) || 'ru';

    const rejectionReasonText =
      action === 'reject'
        ? t(TELEGRAM_MESSAGES, 'REJECTION_REASON_TELEGRAM', {}, locale)
        : undefined;

    try {
      await this.productService.moderateProduct(
        productId,
        adminUserId,
        UserRole.ADMIN,
        {
          action: action === 'approve' ? 'approve' : 'reject',
          rejectionReason:
            action === 'reject' ? rejectionReasonText : undefined,
        },
      );

      const originalText: string = message.text ?? '';
      const statusLine =
        action === 'approve'
          ? t(TELEGRAM_MESSAGES, 'STATUS_PUBLISHED', {}, locale)
          : t(
              TELEGRAM_MESSAGES,
              'STATUS_REJECTED',
              {
                reason:
                  rejectionReasonText ||
                  t(TELEGRAM_MESSAGES, 'REASON_NOT_SPECIFIED', {}, locale),
              },
              locale,
            );

      await this.telegramService.editMessageText({
        chatId: message.chat.id,
        messageId: message.message_id,
        text: `${originalText}${statusLine}`,
        replyMarkup: { inline_keyboard: [] },
      });

      if (callbackId) {
        await this.telegramService.answerCallbackQuery(
          callbackId,
          action === 'approve'
            ? t(TELEGRAM_MESSAGES, 'CALLBACK_PUBLISHED', {}, locale)
            : t(TELEGRAM_MESSAGES, 'CALLBACK_REJECTED', {}, locale),
        );
      }
    } catch {
      if (callbackId) {
        await this.telegramService.answerCallbackQuery(
          callbackId,
          t(TELEGRAM_MESSAGES, 'MODERATION_ERROR', {}, locale),
        );
      }
    }

    return { ok: true };
  }

  private async getAdminUserId(): Promise<string | null> {
    const fromEnv = this.configService.get<string>('ADMIN_USER_ID');
    if (fromEnv) return fromEnv;
    const admin = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN, deletedAt: null },
      select: { id: true },
    });
    return admin?.id ?? null;
  }
}
