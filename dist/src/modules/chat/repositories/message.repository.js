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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MessageRepository = class MessageRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return await this.prisma.message.create({
            data,
        });
    }
    async findById(id, include) {
        return await this.prisma.message.findUnique({
            where: { id },
            include,
        });
    }
    async findMany(where, include, orderBy, take, skip, cursor) {
        return await this.prisma.message.findMany({
            where,
            include,
            orderBy,
            take,
            skip,
            cursor,
        });
    }
    async update(where, data) {
        return await this.prisma.message.update({
            where,
            data,
        });
    }
    async updateMany(where, data) {
        return await this.prisma.message.updateMany({
            where,
            data,
        });
    }
    async count(where) {
        return await this.prisma.message.count({
            where,
        });
    }
    async markAsRead(conversationId, userId, messageIds) {
        const where = {
            conversationId,
            senderId: { not: userId },
            isRead: false,
            isDeleted: false,
        };
        if (messageIds && messageIds.length > 0) {
            where.id = { in: messageIds };
        }
        return await this.prisma.message.updateMany({
            where,
            data: {
                isRead: true,
                readAt: new Date(),
                deliveryStatus: client_1.DeliveryStatus.READ,
            },
        });
    }
    async updateDeliveryStatus(messageId, status) {
        return await this.prisma.message.update({
            where: { id: messageId },
            data: {
                deliveryStatus: status,
                ...(status === 'READ' && {
                    isRead: true,
                    readAt: new Date(),
                }),
            },
        });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessageRepository);
//# sourceMappingURL=message.repository.js.map