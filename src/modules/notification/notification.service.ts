import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import {
  Prisma,
  UserRole,
  NotificationType,
  NotificationPreference,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IFirebaseService,
  FIREBASE_SERVICE_TOKEN,
} from '../../infrastructure/firebase/firebase-service.interface';
import { Inject } from '@nestjs/common';
import { PresenceService } from '../../redis/presence.service';
import { DeviceTokensService } from '../../redis/device-tokens.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly prisma: PrismaService,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    private readonly presenceService: PresenceService,
    private readonly deviceTokensService: DeviceTokensService,
  ) { }

  private getUserLanguage(user: {
    language: string | null;
  }): 'uz' | 'ru' | 'en' {
    const lang = (user.language || '').toLowerCase();
    if (lang === 'ru' || lang === 'en') return lang;
    return 'uz';
  }

  private async getDeliveryModeForType(
    type: NotificationType,
    userId: string,
  ): Promise<'data-only' | 'notification'> {
    if (
      type === NotificationType.NEW_BID ||
      type === NotificationType.OUTBID ||
      type === NotificationType.BID_REJECTED ||
      type === NotificationType.AUCTION_ENDED ||
      type === NotificationType.AUCTION_ENDING_SOON ||
      type === NotificationType.AUCTION_STARTED
    ) {
      const online = await this.presenceService.isOnline(userId);
      return online ? 'data-only' : 'notification';
    }
    return 'notification';
  }

  private isNotificationEnabled(
    prefs: NotificationPreference | null,
    kind:
      | 'auctionEndingSoon'
      | 'auctionEnded'
      | 'auctionStarted'
      | 'newBid'
      | 'outbid'
      | 'orderConfirmed'
      | 'orderShipped'
      | 'orderDelivered'
      | 'newMessage'
      | 'system',
  ): boolean {
    if (!prefs || !prefs.isActive || !prefs.pushEnabled) {
      return false;
    }

    switch (kind) {
      case 'auctionEndingSoon':
        return prefs.auctionEndingSoon;
      case 'auctionEnded':
        return prefs.auctionEnded;
      case 'auctionStarted':
        return prefs.auctionStarted;
      case 'newBid':
        return prefs.newBid;
      case 'outbid':
        return prefs.outbid;
      case 'orderConfirmed':
        return prefs.orderConfirmed;
      case 'orderShipped':
        return prefs.orderShipped;
      case 'orderDelivered':
        return prefs.orderDelivered;
      case 'newMessage':
        return prefs.newMessage;
      case 'system':
        return prefs.system;
      default:
        return true;
    }
  }

  private getLocalizedText(
    type:
      | NotificationType
      | 'NEW_MESSAGE_SYSTEM'
      | 'NEW_BID_SELLER'
      | 'BID_REJECTED'
      | 'AUCTION_EXTENDED',
    lang: 'uz' | 'ru' | 'en',
    context: {
      productTitle?: string;
      amount?: number;
      currency?: string;
      newEndTime?: Date;
      bidderName?: string;
      isWinner?: boolean;
      orderNumber?: string;
    } = {},
  ): { title: string; message: string } {
    const titleKey = type;
    const amountText =
      context.amount !== undefined && context.currency
        ? `${context.amount} ${context.currency}`
        : '';
    const product = context.productTitle || '';

    if (titleKey === 'OUTBID') {
      if (lang === 'ru') {
        return {
          title: 'Вашу ставку перебили',
          message:
            `В аукционе по букету "${product}" вашу ставку перебили. Текущая ставка: ${amountText}`.trim(),
        };
      }
      if (lang === 'en') {
        return {
          title: 'You have been outbid',
          message:
            `Your bid was outbid in the auction for "${product}". Current bid: ${amountText}`.trim(),
        };
      }
      return {
        title: 'Sizning stavkangiz oshirildi',
        message:
          `"${product}" buketi bo‘yicha auksionda stavkangiz oshirildi. Joriy stavka: ${amountText}`.trim(),
      };
    }

    if (titleKey === 'NEW_BID_SELLER') {
      if (lang === 'ru') {
        return {
          title: 'Новая ставка на ваш букет',
          message:
            `На ваш букет "${product}" сделана новая ставка: ${amountText}`.trim(),
        };
      }
      if (lang === 'en') {
        return {
          title: 'New bid on your bouquet',
          message:
            `Your bouquet "${product}" received a new bid: ${amountText}`.trim(),
        };
      }
      return {
        title: 'Yangi stavka',
        message:
          `Sizning "${product}" buketingizga yangi stavka qo‘yildi: ${amountText}`.trim(),
      };
    }

    if (titleKey === 'AUCTION_ENDED') {
      const isWinner = !!context.isWinner;
      if (lang === 'ru') {
        return {
          title: 'Аукцион завершён',
          message: isWinner
            ? `Вы выиграли аукцион по букету "${product}".`
            : `Аукцион по букету "${product}" завершён.`.trim(),
        };
      }
      if (lang === 'en') {
        return {
          title: 'Auction ended',
          message: isWinner
            ? `You won the auction for "${product}".`
            : `The auction for "${product}" has ended.`,
        };
      }
      return {
        title: 'Auksion yakunlandi',
        message: isWinner
          ? `"${product}" buketi bo‘yicha auksionda g‘olib bo‘ldingiz.`
          : `"${product}" buketi bo‘yicha auksion yakunlandi.`,
      };
    }

    if (titleKey === 'AUCTION_EXTENDED') {
      const formattedTime = context.newEndTime
        ? new Date(context.newEndTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
        : '';
      if (lang === 'ru') {
        return {
          title: 'Аукцион продлён',
          message: `Аукцион продлён до ${formattedTime}`.trim(),
        };
      }
      if (lang === 'en') {
        return {
          title: 'Auction extended',
          message: `Auction extended until ${formattedTime}`.trim(),
        };
      }
      return {
        title: 'Auksion uzaytildi',
        message: `Auksion ${formattedTime} ga qadar uzaytirildi.`.trim(),
      };
    }

    if (titleKey === 'BID_REJECTED') {
      if (lang === 'ru') {
        return {
          title: 'Ваша ставка отклонена',
          message:
            `Автор аукциона отклонил вашу ставку${amountText ? ` на сумму ${amountText}` : ''} по букету "${product}".`.trim(),
        };
      }
      if (lang === 'en') {
        return {
          title: 'Your bid was rejected',
          message:
            `The auction owner rejected your bid${amountText ? ` of ${amountText}` : ''} for "${product}".`.trim(),
        };
      }
      return {
        title: 'Stavkangiz rad etildi',
        message:
          `Auksion muallifi "${product}" buketi bo'yicha${amountText ? ` ${amountText} miqdoridagi` : ''} stavkangizni rad etdi.`.trim(),
      };
    }

    if (titleKey === 'ORDER_CONFIRMED') {
      if (lang === 'ru') {
        return {
          title: 'Заказ подтверждён',
          message: `Продавец подтвердил ваш заказ №${context.orderNumber || ''} по букету "${product}".`,
        };
      }
      if (lang === 'en') {
        return {
          title: 'Order confirmed',
          message: `Seller confirmed your order #${context.orderNumber || ''} for "${product}".`,
        };
      }
      return {
        title: 'Buyurtma tasdiqlandi',
        message: `Sotuvchi "${product}" buketi bo'yicha #${context.orderNumber || ''} buyurtmangizni tasdiqladi.`,
      };
    }

    if (titleKey === 'ORDER_SHIPPED') {
      if (lang === 'ru') {
        return {
          title: 'Заказ отправлен',
          message: `Ваш заказ №${context.orderNumber || ''} по букету "${product}" отправлен.`,
        };
      }
      if (lang === 'en') {
        return {
          title: 'Order shipped',
          message: `Your order #${context.orderNumber || ''} for "${product}" has been shipped.`,
        };
      }
      return {
        title: 'Buyurtma yuborildi',
        message: `"${product}" buketi bo'yicha #${context.orderNumber || ''} buyurtmangiz yuborildi.`,
      };
    }

    if (titleKey === 'ORDER_DELIVERED') {
      if (lang === 'ru') {
        return {
          title: 'Заказ доставлен',
          message: `Заказ №${context.orderNumber || ''} по букету "${product}" доставлен.`,
        };
      }
      if (lang === 'en') {
        return {
          title: 'Order delivered',
          message: `Order #${context.orderNumber || ''} for "${product}" has been delivered.`,
        };
      }
      return {
        title: 'Buyurtma yetkazildi',
        message: `"${product}" buketi bo'yicha #${context.orderNumber || ''} buyurtma yetkazildi.`,
      };
    }

    if (titleKey === 'NEW_MESSAGE_SYSTEM') {
      const name = context.bidderName || '';
      if (lang === 'ru') {
        return {
          title: 'Новое сообщение',
          message: `${name || 'Пользователь'} отправил вам новое сообщение.`,
        };
      }
      if (lang === 'en') {
        return {
          title: 'New message',
          message: `${name || 'User'} sent you a new message.`,
        };
      }
      return {
        title: 'Yangi xabar',
        message: `${name || 'Foydalanuvchi'} sizga yangi xabar yubordi.`,
      };
    }

    if (lang === 'ru') {
      return {
        title: 'Уведомление',
        message: 'У вас новое уведомление.',
      };
    }
    if (lang === 'en') {
      return {
        title: 'Notification',
        message: 'You have a new notification.',
      };
    }
    return {
      title: 'Bildirishnoma',
      message: 'Sizda yangi bildirishnoma bor.',
    };
  }

  private async persistAndPush(
    user: {
      id: string;
      fcmToken: string | null;
    },
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.create({
      user: {
        connect: { id: user.id },
      },
      type,
      title,
      message,
      data: data ? (data as Prisma.InputJsonValue) : undefined,
    });

    this.logger.log(
      `Notification created: ${notification.id} for user ${user.id}, type: ${type}`,
    );

    const deviceTokens = await this.deviceTokensService.getTokens(user.id);
    const tokens = deviceTokens.length > 0
      ? deviceTokens
      : (user.fcmToken ? [user.fcmToken] : []);

    if (tokens.length > 0) {
      try {
        const notificationData: Record<string, string> = {
          notificationId: notification.id,
          type,
          ...(data
            ? Object.fromEntries(
              Object.entries(data).map(([key, value]) => [
                key,
                String(value),
              ]),
            )
            : {}),
        };

        const deliveryMode = await this.getDeliveryModeForType(type, user.id);
        const { success, failure } = await this.firebaseService.sendNotificationToMultiple(
          tokens,
          title,
          message,
          notificationData,
          { deliveryMode },
        );

        if (success > 0) {
          this.logger.log(
            `FCM multicast sent for notification ${notification.id}: ${success} success, ${failure} failure (user ${user.id})`,
          );
        } else {
          this.logger.warn(
            `Failed to send FCM push notifications to user ${user.id} for notification ${notification.id}. Tokens may be invalid.`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error sending FCM push notification to user ${user.id}`,
          error instanceof Error ? error.stack : error,
        );

        if (error instanceof Error && error.message === 'INVALID_TOKEN') {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { fcmToken: null },
          });
          this.logger.log(
            `Removed invalid FCM token for user ${user.id} after send failure`,
          );
        }
      }
    } else {
      this.logger.debug(
        `User ${user.id} has no FCM token. Push notification skipped.`,
      );
    }

    return NotificationResponseDto.fromEntity(notification);
  }

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, fcmToken: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    return this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      dto.type,
      dto.title,
      dto.message,
      dto.data,
    );
  }

  async notifyOutbid(params: {
    userId: string;
    auctionId: string;
    productId: string;
    productTitle?: string;
    amount?: number;
    currency?: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `notifyOutbid: user ${params.userId} not found, skipping notification`,
      );
      return;
    }

    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'outbid')) {
      return;
    }

    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText('OUTBID', lang, {
      productTitle: params.productTitle,
      amount: params.amount,
      currency: params.currency,
    });

    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.OUTBID,
      title,
      message,
      {
        auctionId: params.auctionId,
        productId: params.productId,
        ...(params.amount !== undefined
          ? { amount: String(params.amount) }
          : {}),
        ...(params.currency ? { currency: params.currency } : {}),
      },
    );
  }

  async notifyNewBidForSeller(params: {
    sellerId: string;
    auctionId: string;
    productId: string;
    productTitle?: string;
    amount?: number;
    currency?: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.sellerId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `notifyNewBidForSeller: user ${params.sellerId} not found, skipping notification`,
      );
      return;
    }

    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'newBid')) {
      return;
    }

    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText('NEW_BID_SELLER', lang, {
      productTitle: params.productTitle,
      amount: params.amount,
      currency: params.currency,
    });

    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.NEW_BID,
      title,
      message,
      {
        auctionId: params.auctionId,
        productId: params.productId,
        ...(params.amount !== undefined
          ? { amount: String(params.amount) }
          : {}),
        ...(params.currency ? { currency: params.currency } : {}),
      },
    );
  }

  async notifyBidRejected(params: {
    userId: string;
    auctionId: string;
    productId: string;
    productTitle?: string;
    amount?: number;
    currency?: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `notifyBidRejected: user ${params.userId} not found, skipping notification`,
      );
      return;
    }

    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'outbid')) {
      return;
    }

    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText('BID_REJECTED', lang, {
      productTitle: params.productTitle,
      amount: params.amount,
      currency: params.currency,
    });

    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.BID_REJECTED,
      title,
      message,
      {
        auctionId: params.auctionId,
        productId: params.productId,
        ...(params.amount !== undefined
          ? { amount: String(params.amount) }
          : {}),
        ...(params.currency ? { currency: params.currency } : {}),
      },
    );
  }

  async notifyAuctionEndedForParticipant(params: {
    userId: string;
    auctionId: string;
    productId: string;
    productTitle?: string;
    isWinner: boolean;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `notifyAuctionEndedForParticipant: user ${params.userId} not found, skipping notification`,
      );
      return;
    }

    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'auctionEnded')) {
      return;
    }

    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      NotificationType.AUCTION_ENDED,
      lang,
      {
        productTitle: params.productTitle,
        isWinner: params.isWinner,
      },
    );

    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.AUCTION_ENDED,
      title,
      message,
      {
        auctionId: params.auctionId,
        productId: params.productId,
        isWinner: String(params.isWinner),
      },
    );
  }

  async notifyAuctionExtendedForParticipant(params: {
    userId: string;
    auctionId: string;
    productId: string;
    newEndTime: Date;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, fcmToken: true, notificationPreference: true, language: true },
    });

    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'auctionEndingSoon')) {
      return;
    }

    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText('AUCTION_EXTENDED', lang, {
      newEndTime: params.newEndTime,
    });

    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.AUCTION_ENDING_SOON,
      title,
      message,
      {
        auctionId: params.auctionId,
        productId: params.productId,
        newEndTime: params.newEndTime.toISOString(),
        event: 'AUCTION_EXTENDED',
      },
    );
  }

  async notifyOrderConfirmed(params: {
    buyerId: string;
    orderId: string;
    orderNumber: string;
    productId: string;
    productTitle?: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.buyerId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });
    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'orderConfirmed')) return;
    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      NotificationType.ORDER_CONFIRMED,
      lang,
      {
        productTitle: params.productTitle,
        orderNumber: params.orderNumber,
      },
    );
    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.ORDER_CONFIRMED,
      title,
      message,
      { orderId: params.orderId, productId: params.productId },
    );
  }

  async notifyOrderShipped(params: {
    buyerId: string;
    orderId: string;
    orderNumber: string;
    productId: string;
    productTitle?: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.buyerId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });
    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'orderShipped')) return;
    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      NotificationType.ORDER_SHIPPED,
      lang,
      {
        productTitle: params.productTitle,
        orderNumber: params.orderNumber,
      },
    );
    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.ORDER_SHIPPED,
      title,
      message,
      { orderId: params.orderId, productId: params.productId },
    );
  }

  async notifyOrderDelivered(params: {
    buyerId: string;
    orderId: string;
    orderNumber: string;
    productId: string;
    productTitle?: string;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.buyerId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });
    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'orderDelivered')) return;
    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      NotificationType.ORDER_DELIVERED,
      lang,
      {
        productTitle: params.productTitle,
        orderNumber: params.orderNumber,
      },
    );
    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.ORDER_DELIVERED,
      title,
      message,
      { orderId: params.orderId, productId: params.productId },
    );
  }

  async notifyNewMessage(params: {
    recipientId: string;
    conversationId: string;
    productId?: string;
    orderId?: string;
    senderName?: string | null;
  }): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.recipientId },
      select: {
        id: true,
        fcmToken: true,
        language: true,
        notificationPreference: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `notifyNewMessage: user ${params.recipientId} not found, skipping notification`,
      );
      return;
    }

    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'newMessage')) {
      return;
    }

    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      'NEW_MESSAGE_SYSTEM',
      lang,
      {
        bidderName: params.senderName || undefined,
      },
    );

    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.SYSTEM,
      title,
      message,
      {
        conversationId: params.conversationId,
        ...(params.productId ? { productId: params.productId } : {}),
        ...(params.orderId ? { orderId: params.orderId } : {}),
      },
    );
  }

  async findAll(
    query: NotificationQueryDto,
    userId: string,
    userRole: UserRole,
  ) {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.NotificationWhereInput = {
      userId: userRole === UserRole.ADMIN ? undefined : userId,
    };

    if (type) {
      where.type = type;
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const orderBy: Prisma.NotificationOrderByWithRelationInput = {};
    if (sortBy === 'readAt') {
      orderBy.readAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [notifications, total] = await Promise.all([
      this.notificationRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
      }),
      this.notificationRepository.count({ where }),
    ]);

    return {
      data: notifications.map((notification) =>
        NotificationResponseDto.fromEntity(notification),
      ),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async findById(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only view your own notifications');
    }

    return NotificationResponseDto.fromEntity(notification);
  }

  async updateNotification(
    id: string,
    dto: UpdateNotificationDto,
    userId: string,
    userRole: UserRole,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only update your own notifications',
      );
    }

    const updateData: Prisma.NotificationUpdateInput = {};

    if (dto.isRead !== undefined) {
      updateData.isRead = dto.isRead;
      if (dto.isRead) {
        updateData.readAt = new Date();
      } else {
        updateData.readAt = null;
      }
    }

    const updatedNotification = await this.notificationRepository.update(
      id,
      updateData,
    );

    this.logger.log(`Notification ${id} updated by user ${userId}`);

    return NotificationResponseDto.fromEntity(updatedNotification);
  }

  async markAsRead(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only mark your own notifications as read',
      );
    }

    await this.notificationRepository.markAsRead(id);

    this.logger.log(`Notification ${id} marked as read by user ${userId}`);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const count = await this.notificationRepository.markAllAsRead(userId);

    this.logger.log(
      `All notifications marked as read for user ${userId}. Count: ${count}`,
    );

    return count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async deleteNotification(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only delete your own notifications',
      );
    }

    await this.notificationRepository.delete(id);

    this.logger.log(`Notification ${id} deleted by user ${userId}`);
  }
}
