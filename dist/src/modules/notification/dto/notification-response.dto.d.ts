import { Notification, NotificationType } from '@prisma/client';
export declare class NotificationResponseDto {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: object | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    static fromEntity(notification: Notification): NotificationResponseDto;
}
