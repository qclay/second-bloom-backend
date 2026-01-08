import { NotificationType } from '@prisma/client';
export declare class NotificationQueryDto {
    page?: number;
    limit?: number;
    type?: NotificationType;
    isRead?: boolean;
    sortBy?: 'createdAt' | 'readAt';
    sortOrder?: 'asc' | 'desc';
}
