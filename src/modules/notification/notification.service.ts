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

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly prisma: PrismaService,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
  ) {}

  private getUserLanguage(user: {
    language: string | null;
  }): 'uz' | 'ru' | 'en' {
    const lang = (user.language || '').toLowerCase();
    if (lang === 'ru' || lang === 'en') return lang;
    return 'uz';
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
      | 'reviewReceived'
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
      case 'reviewReceived':
        return prefs.reviewReceived;
      case 'newMessage':
        return prefs.newMessage;
      case 'system':
        return prefs.system;
      default:
        return true;
    }
  }

  private getLocalizedText(
    type: NotificationType | 'NEW_MESSAGE_SYSTEM' | 'NEW_BID_SELLER',
    lang: 'uz' | 'ru' | 'en',
    context: {
      productTitle?: string;
      amount?: number;
      currency?: string;
      bidderName?: string;
      isWinner?: boolean;
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

    // Fallback for other types: generic system notification
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

    if (user.fcmToken) {
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

        const sent = await this.firebaseService.sendNotification(
          user.fcmToken,
          title,
          message,
          notificationData,
        );

        if (sent) {
          this.logger.log(
            `FCM push notification sent to user ${user.id} for notification ${notification.id}`,
          );
        } else {
          this.logger.warn(
            `Failed to send FCM push notification to user ${user.id} for notification ${notification.id}. Token may be invalid.`,
          );

          const isValid = this.firebaseService.validateToken(user.fcmToken);
          if (!isValid) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { fcmToken: null },
            });
            this.logger.log(
              `Removed invalid FCM token format for user ${user.id}`,
            );
          }
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
      },
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
