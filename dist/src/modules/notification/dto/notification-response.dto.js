"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class NotificationResponseDto {
    id;
    userId;
    type;
    title;
    message;
    data;
    isRead;
    readAt;
    createdAt;
    static fromEntity(notification) {
        return {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, type: { required: true, type: () => Object }, title: { required: true, type: () => String }, message: { required: true, type: () => String }, data: { required: true, type: () => Object, nullable: true }, isRead: { required: true, type: () => Boolean }, readAt: { required: true, type: () => Date, nullable: true }, createdAt: { required: true, type: () => Date } };
    }
}
exports.NotificationResponseDto = NotificationResponseDto;
//# sourceMappingURL=notification-response.dto.js.map