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
import { Prisma, UserRole } from '@prisma/client';
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

    const notification = await this.notificationRepository.create({
      user: {
        connect: { id: dto.userId },
      },
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data ? (dto.data as Prisma.InputJsonValue) : undefined,
    });

    this.logger.log(
      `Notification created: ${notification.id} for user ${dto.userId}, type: ${dto.type}`,
    );

    if (user.fcmToken) {
      try {
        const notificationData: Record<string, string> = {
          notificationId: notification.id,
          type: dto.type,
          ...(dto.data
            ? Object.fromEntries(
                Object.entries(dto.data).map(([key, value]) => [
                  key,
                  String(value),
                ]),
              )
            : {}),
        };

        const sent = await this.firebaseService.sendNotification(
          user.fcmToken,
          dto.title,
          dto.message,
          notificationData,
        );

        if (sent) {
          this.logger.log(
            `FCM push notification sent to user ${dto.userId} for notification ${notification.id}`,
          );
        } else {
          this.logger.warn(
            `Failed to send FCM push notification to user ${dto.userId} for notification ${notification.id}. Token may be invalid.`,
          );

          const isValid = this.firebaseService.validateToken(user.fcmToken);
          if (!isValid) {
            await this.prisma.user.update({
              where: { id: dto.userId },
              data: { fcmToken: null },
            });
            this.logger.log(
              `Removed invalid FCM token format for user ${dto.userId}`,
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Error sending FCM push notification to user ${dto.userId}`,
          error instanceof Error ? error.stack : error,
        );

        if (error instanceof Error && error.message === 'INVALID_TOKEN') {
          await this.prisma.user.update({
            where: { id: dto.userId },
            data: { fcmToken: null },
          });
          this.logger.log(
            `Removed invalid FCM token for user ${dto.userId} after send failure`,
          );
        }
      }
    } else {
      this.logger.debug(
        `User ${dto.userId} has no FCM token. Push notification skipped.`,
      );
    }

    return NotificationResponseDto.fromEntity(notification);
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
