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
exports.ConversationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ConversationRepository = class ConversationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return await this.prisma.conversation.create({
            data,
        });
    }
    async findById(id, include) {
        return await this.prisma.conversation.findUnique({
            where: { id },
            include,
        });
    }
    async findMany(where, include, orderBy, take, skip) {
        return await this.prisma.conversation.findMany({
            where,
            include,
            orderBy,
            take,
            skip,
        });
    }
    async findUnique(where, include) {
        return await this.prisma.conversation.findUnique({
            where,
            include,
        });
    }
    async update(where, data) {
        return await this.prisma.conversation.update({
            where,
            data,
        });
    }
    async count(where) {
        return await this.prisma.conversation.count({
            where,
        });
    }
    async updateLastMessage(conversationId, messageId, lastMessageAt) {
        return await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageId: messageId,
                lastMessageAt,
            },
        });
    }
    async updateUnreadCount(conversationId, isSeller, increment) {
        const field = isSeller ? 'unreadCountBySeller' : 'unreadCountByBuyer';
        const current = await this.findById(conversationId);
        if (!current) {
            throw new Error('Conversation not found');
        }
        const newCount = increment
            ? current[field] + 1
            : Math.max(0, current[field] - 1);
        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                [field]: newCount,
            },
        });
    }
    async updateLastSeen(conversationId, isSeller, lastSeenAt) {
        const field = isSeller ? 'sellerLastSeenAt' : 'buyerLastSeenAt';
        return await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                [field]: lastSeenAt,
            },
        });
    }
};
exports.ConversationRepository = ConversationRepository;
exports.ConversationRepository = ConversationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationRepository);
//# sourceMappingURL=conversation.repository.js.map