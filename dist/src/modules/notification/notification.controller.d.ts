import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UserRole } from '@prisma/client';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(createNotificationDto: CreateNotificationDto, role: UserRole): Promise<NotificationResponseDto>;
    findAll(query: NotificationQueryDto, userId: string, role: UserRole): Promise<{
        data: NotificationResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    findOne(id: string, userId: string, role: UserRole): Promise<NotificationResponseDto>;
    update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string, role: UserRole): Promise<NotificationResponseDto>;
    markAsRead(id: string, userId: string, role: UserRole): Promise<void>;
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<void>;
}
