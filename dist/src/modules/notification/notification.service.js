"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_repository_1 = require("./repositories/notification.repository");
const notification_response_dto_1 = require("./dto/notification-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const firebase_service_interface_1 = require("../../infrastructure/firebase/firebase-service.interface");
const common_2 = require("@nestjs/common");
let NotificationService = NotificationService_1 = class NotificationService {
    notificationRepository;
    prisma;
    firebaseService;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(notificationRepository, prisma, firebaseService) {
        this.notificationRepository = notificationRepository;
        this.prisma = prisma;
        this.firebaseService = firebaseService;
    }
    async createNotification(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: { id: true, fcmToken: true },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${dto.userId} not found`);
        }
        const notification = await this.notificationRepository.create({
            user: {
                connect: { id: dto.userId },
            },
            type: dto.type,
            title: dto.title,
            message: dto.message,
            data: dto.data ? dto.data : undefined,
        });
        this.logger.log(`Notification created: ${notification.id} for user ${dto.userId}, type: ${dto.type}`);
        if (user.fcmToken) {
            try {
                const notificationData = {
                    notificationId: notification.id,
                    type: dto.type,
                    ...(dto.data
                        ? Object.fromEntries(Object.entries(dto.data).map(([key, value]) => [
                            key,
                            String(value),
                        ]))
                        : {}),
                };
                const sent = await this.firebaseService.sendNotification(user.fcmToken, dto.title, dto.message, notificationData);
                if (sent) {
                    this.logger.log(`FCM push notification sent to user ${dto.userId} for notification ${notification.id}`);
                }
                else {
                    this.logger.warn(`Failed to send FCM push notification to user ${dto.userId} for notification ${notification.id}. Token may be invalid.`);
                    const isValid = this.firebaseService.validateToken(user.fcmToken);
                    if (!isValid) {
                        await this.prisma.user.update({
                            where: { id: dto.userId },
                            data: { fcmToken: null },
                        });
                        this.logger.log(`Removed invalid FCM token format for user ${dto.userId}`);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error sending FCM push notification to user ${dto.userId}`, error instanceof Error ? error.stack : error);
                if (error instanceof Error && error.message === 'INVALID_TOKEN') {
                    await this.prisma.user.update({
                        where: { id: dto.userId },
                        data: { fcmToken: null },
                    });
                    this.logger.log(`Removed invalid FCM token for user ${dto.userId} after send failure`);
                }
            }
        }
        else {
            this.logger.debug(`User ${dto.userId} has no FCM token. Push notification skipped.`);
        }
        return notification_response_dto_1.NotificationResponseDto.fromEntity(notification);
    }
    async findAll(query, userId, userRole) {
        const { page = 1, limit = 20, type, isRead, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            userId: userRole === client_1.UserRole.ADMIN ? undefined : userId,
        };
        if (type) {
            where.type = type;
        }
        if (isRead !== undefined) {
            where.isRead = isRead;
        }
        const orderBy = {};
        if (sortBy === 'readAt') {
            orderBy.readAt = sortOrder;
        }
        else {
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
            data: notifications.map((notification) => notification_response_dto_1.NotificationResponseDto.fromEntity(notification)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id, userId, userRole) {
        const notification = await this.notificationRepository.findById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        if (notification.userId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only view your own notifications');
        }
        return notification_response_dto_1.NotificationResponseDto.fromEntity(notification);
    }
    async updateNotification(id, dto, userId, userRole) {
        const notification = await this.notificationRepository.findById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        if (notification.userId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own notifications');
        }
        const updateData = {};
        if (dto.isRead !== undefined) {
            updateData.isRead = dto.isRead;
            if (dto.isRead) {
                updateData.readAt = new Date();
            }
            else {
                updateData.readAt = null;
            }
        }
        const updatedNotification = await this.notificationRepository.update(id, updateData);
        this.logger.log(`Notification ${id} updated by user ${userId}`);
        return notification_response_dto_1.NotificationResponseDto.fromEntity(updatedNotification);
    }
    async markAsRead(id, userId, userRole) {
        const notification = await this.notificationRepository.findById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        if (notification.userId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only mark your own notifications as read');
        }
        await this.notificationRepository.markAsRead(id);
        this.logger.log(`Notification ${id} marked as read by user ${userId}`);
    }
    async markAllAsRead(userId) {
        const count = await this.notificationRepository.markAllAsRead(userId);
        this.logger.log(`All notifications marked as read for user ${userId}. Count: ${count}`);
        return count;
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.getUnreadCount(userId);
    }
    async deleteNotification(id, userId, userRole) {
        const notification = await this.notificationRepository.findById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        if (notification.userId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own notifications');
        }
        await this.notificationRepository.delete(id);
        this.logger.log(`Notification ${id} deleted by user ${userId}`);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_2.Inject)(firebase_service_interface_1.FIREBASE_SERVICE_TOKEN)),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository,
        prisma_service_1.PrismaService, Object])
], NotificationService);
//# sourceMappingURL=notification.service.js.map