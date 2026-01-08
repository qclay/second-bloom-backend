import { NotificationRepository } from './repositories/notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IFirebaseService } from '../../infrastructure/firebase/firebase-service.interface';
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly prisma;
    private readonly firebaseService;
    private readonly logger;
    constructor(notificationRepository: NotificationRepository, prisma: PrismaService, firebaseService: IFirebaseService);
    createNotification(dto: CreateNotificationDto): Promise<NotificationResponseDto>;
    findAll(query: NotificationQueryDto, userId: string, userRole: UserRole): Promise<{
        data: NotificationResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, userId: string, userRole: UserRole): Promise<NotificationResponseDto>;
    updateNotification(id: string, dto: UpdateNotificationDto, userId: string, userRole: UserRole): Promise<NotificationResponseDto>;
    markAsRead(id: string, userId: string, userRole: UserRole): Promise<void>;
    markAllAsRead(userId: string): Promise<number>;
    getUnreadCount(userId: string): Promise<number>;
    deleteNotification(id: string, userId: string, userRole: UserRole): Promise<void>;
}
