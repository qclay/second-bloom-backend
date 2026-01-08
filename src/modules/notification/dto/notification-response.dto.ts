import { Notification, NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  id!: string;
  userId!: string;
  type!: NotificationType;
  title!: string;
  message!: string;
  data!: object | null;
  isRead!: boolean;
  readAt!: Date | null;
  createdAt!: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data as object | null,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
