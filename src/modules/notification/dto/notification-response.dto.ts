import { Notification, NotificationType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { toISOString } from '../../../common/utils/date.util';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true })
  data!: object | null;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  readAt!: string | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  static fromEntity(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data as object | null,
      isRead: notification.isRead,
      readAt: toISOString(notification.readAt),
      createdAt: toISOString(notification.createdAt) ?? '',
    };
  }
}
