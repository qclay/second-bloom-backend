import { NotificationType } from '@prisma/client';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}
