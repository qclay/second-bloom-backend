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
import { NOTIFICATION_MESSAGES } from '../../common/i18n/notifications.i18n';
import { t, type Locale } from '../../common/i18n/translation.util';

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
  ) {}

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
      this.logger.debug(
        `Delivery mode decision for user ${userId}, type ${type}: ${online ? 'data-only' : 'notification'} (online=${online})`,
      );
      return online ? 'data-only' : 'notification';
    }
    this.logger.debug(
      `Delivery mode decision for user ${userId}, type ${type}: notification (default for type)`,
    );
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
      | 'AUCTION_EXTENDED'
      | 'ORDER_CANCELLED'
      | 'PRODUCT_APPROVED'
      | 'PRODUCT_REJECTED',
    lang: Locale,
    context: {
      productTitle?: string;
      amount?: number;
      currency?: string;
      newEndTime?: Date;
      bidderName?: string;
      isWinner?: boolean;
      orderNumber?: string;
      reason?: string;
    } = {},
  ): { title: string; message: string } {
    const amountText =
      context.amount !== undefined && context.currency
        ? `${context.amount} ${context.currency}`
        : '';
    const product = context.productTitle || '';

    let key = type as string;
    const params: Record<string, string | number | undefined> = {
      product,
      amountText,
      orderNumber: context.orderNumber || '',
    };

    if (key === 'AUCTION_ENDED') {
      key = context.isWinner ? 'AUCTION_ENDED_WINNER' : 'AUCTION_ENDED';
    } else if (key === 'AUCTION_EXTENDED') {
      params.formattedTime = context.newEndTime
        ? new Date(context.newEndTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
    } else if (key === 'BID_REJECTED') {
      const amountSuffixes: Record<Locale, string> = {
        ru: amountText ? ` на сумму ${amountText}` : '',
        en: amountText ? ` of ${amountText}` : '',
        uz: amountText ? ` ${amountText} miqdoridagi` : '',
      };
      params.amountSuffix = amountSuffixes[lang] || '';
    } else if (key === 'NEW_MESSAGE_SYSTEM') {
      key = 'NEW_MESSAGE';
      const defaultNames: Record<Locale, string> = {
        ru: 'Пользователь',
        en: 'User',
        uz: 'Foydalanuvchi',
      };
      params.name = context.bidderName || defaultNames[lang] || 'User';
    } else if (key === 'PRODUCT_REJECTED') {
      params.reason = context.reason || '';
    }

    const config = NOTIFICATION_MESSAGES[key] || NOTIFICATION_MESSAGES.DEFAULT;

    return {
      title: t({ [key]: config.title }, key, params, lang),
      message: t({ [key]: config.message }, key, params, lang),
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
    this.logger.debug(
      `persistAndPush started for user ${user.id}, type ${type}`,
    );

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
    const tokens =
      deviceTokens.length > 0
        ? deviceTokens
        : user.fcmToken
          ? [user.fcmToken]
          : [];

    this.logger.debug(
      `Notification ${notification.id}: token sources for user ${user.id} -> deviceTokens=${deviceTokens.length}, legacyTokenPresent=${Boolean(user.fcmToken)}, chosenTokens=${tokens.length}`,
    );

    if (tokens.length > 0) {
      try {
        const notificationData: Record<string, string> = {
          notificationId: notification.id,
          type,
          title,
          message,
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
        this.logger.debug(
          `Notification ${notification.id}: sending via Firebase for user ${user.id} with deliveryMode=${deliveryMode}, tokens=${tokens.length}`,
        );

        const { success, failure } =
          await this.firebaseService.sendNotificationToMultiple(
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

        if (error && typeof error === 'object' && 'code' in error) {
          const firebaseError = error as { code?: string; message?: string };
          this.logger.warn(
            `Firebase send error metadata for user ${user.id}: code=${firebaseError.code || 'unknown'}, message=${firebaseError.message || 'unknown'}`,
          );
        }

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
        `Notification ${notification.id}: user ${user.id} has no FCM token. Push notification skipped.`,
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
      this.logger.debug(
        `notifyOutbid skipped for user ${params.userId}: notification preference disabled`,
      );
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
      this.logger.debug(
        `notifyNewBidForSeller skipped for user ${params.sellerId}: notification preference disabled`,
      );
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
      this.logger.debug(
        `notifyBidRejected skipped for user ${params.userId}: notification preference disabled`,
      );
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
      this.logger.debug(
        `notifyAuctionEndedForParticipant skipped for user ${params.userId}: notification preference disabled`,
      );
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
      select: {
        id: true,
        fcmToken: true,
        notificationPreference: true,
        language: true,
      },
    });

    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'auctionEndingSoon')) {
      this.logger.debug(
        `notifyAuctionExtendedForParticipant skipped for user ${params.userId}: notification preference disabled`,
      );
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

  async notifyOrderCancelled(params: {
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
    if (!this.isNotificationEnabled(prefs, 'system')) return;
    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      'ORDER_CANCELLED',
      lang,
      {
        productTitle: params.productTitle,
        orderNumber: params.orderNumber,
      },
    );
    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.SYSTEM,
      title,
      message,
      { event: 'ORDER_CANCELLED', orderId: params.orderId, productId: params.productId },
    );
  }

  async notifyProductApproved(params: {
    sellerId: string;
    productId: string;
    productTitle?: string;
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
    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'system')) return;
    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      'PRODUCT_APPROVED',
      lang,
      { productTitle: params.productTitle },
    );
    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.SYSTEM,
      title,
      message,
      { event: 'PRODUCT_APPROVED', productId: params.productId },
    );
  }

  async notifyProductRejected(params: {
    sellerId: string;
    productId: string;
    productTitle?: string;
    reason: string;
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
    if (!user) return;
    const prefs = user.notificationPreference;
    if (!this.isNotificationEnabled(prefs, 'system')) return;
    const lang = this.getUserLanguage(user);
    const { title, message } = this.getLocalizedText(
      'PRODUCT_REJECTED',
      lang,
      { productTitle: params.productTitle, reason: params.reason },
    );
    await this.persistAndPush(
      { id: user.id, fcmToken: user.fcmToken },
      NotificationType.SYSTEM,
      title,
      message,
      { event: 'PRODUCT_REJECTED', productId: params.productId, reason: params.reason },
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
