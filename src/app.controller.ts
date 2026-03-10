import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { ProductService } from './modules/product/product.service';
import { UserRole } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './infrastructure/telegram/telegram.service';

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

    const rejectionReasonText =
      action === 'reject'
        ? 'Отклонено через бота Telegram (уточните причину в админке при необходимости)'
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
          ? '\n\n✅ ОПУБЛИКОВАНО'
          : `\n\n❌ ОТКЛОНЕНО \nПричина: ${rejectionReasonText ?? 'Не указана'}`;

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
            ? 'Товар опубликован'
            : 'Товар отклонён через Telegram',
        );
      }
    } catch {
      if (callbackId) {
        await this.telegramService.answerCallbackQuery(
          callbackId,
          'Ошибка модерации',
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
