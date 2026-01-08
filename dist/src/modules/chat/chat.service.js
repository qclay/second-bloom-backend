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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const conversation_repository_1 = require("./repositories/conversation.repository");
const message_repository_1 = require("./repositories/message.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ChatService = ChatService_1 = class ChatService {
    conversationRepository;
    messageRepository;
    prisma;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(conversationRepository, messageRepository, prisma) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.prisma = prisma;
    }
    async createConversation(dto, userId) {
        if (!dto.productId && !dto.orderId) {
            throw new common_1.BadRequestException('Either productId or orderId must be provided');
        }
        return this.prisma.$transaction(async (tx) => {
            let sellerId;
            const buyerId = userId;
            let productId = dto.productId;
            let orderId = dto.orderId;
            if (dto.orderId) {
                const order = await tx.order.findUnique({
                    where: { id: dto.orderId },
                    include: { product: true },
                });
                if (!order) {
                    throw new common_1.NotFoundException('Order not found');
                }
                if (order.buyerId !== userId) {
                    throw new common_1.ForbiddenException('You can only create conversations for your own orders');
                }
                sellerId = order.product.sellerId;
                productId = order.productId;
                orderId = order.id;
            }
            else if (dto.productId) {
                const product = await tx.product.findUnique({
                    where: { id: dto.productId },
                });
                if (!product) {
                    throw new common_1.NotFoundException('Product not found');
                }
                if (product.sellerId === userId) {
                    throw new common_1.BadRequestException('You cannot start a conversation with yourself');
                }
                sellerId = product.sellerId;
            }
            else {
                throw new common_1.BadRequestException('Invalid conversation context');
            }
            const existingConversation = await tx.conversation.findFirst({
                where: {
                    sellerId,
                    buyerId,
                    ...(orderId ? { orderId } : { productId }),
                    deletedAt: null,
                },
            });
            if (existingConversation) {
                const conversation = await tx.conversation.findUnique({
                    where: { id: existingConversation.id },
                    include: {
                        seller: {
                            select: {
                                id: true,
                                phoneNumber: true,
                                firstName: true,
                                lastName: true,
                                avatar: {
                                    select: {
                                        url: true,
                                    },
                                },
                            },
                        },
                        buyer: {
                            select: {
                                id: true,
                                phoneNumber: true,
                                firstName: true,
                                lastName: true,
                                avatar: {
                                    select: {
                                        url: true,
                                    },
                                },
                            },
                        },
                        lastMessage: true,
                    },
                });
                if (!conversation) {
                    throw new common_1.NotFoundException('Conversation not found');
                }
                if (dto.initialMessage) {
                    await this.sendMessageInternal({
                        conversationId: conversation.id,
                        content: dto.initialMessage,
                        messageType: client_1.MessageType.TEXT,
                    }, userId, tx);
                }
                return this.mapConversationToDto(conversation, userId);
            }
            const conversation = await tx.conversation.create({
                data: {
                    seller: { connect: { id: sellerId } },
                    buyer: { connect: { id: buyerId } },
                    ...(orderId ? { order: { connect: { id: orderId } } } : {}),
                    ...(productId ? { product: { connect: { id: productId } } } : {}),
                },
            });
            if (dto.initialMessage) {
                await this.sendMessageInternal({
                    conversationId: conversation.id,
                    content: dto.initialMessage,
                    messageType: client_1.MessageType.TEXT,
                }, userId, tx);
            }
            const fullConversation = await tx.conversation.findUnique({
                where: { id: conversation.id },
                include: {
                    seller: {
                        select: {
                            id: true,
                            phoneNumber: true,
                            firstName: true,
                            lastName: true,
                            avatar: {
                                select: {
                                    url: true,
                                },
                            },
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            phoneNumber: true,
                            firstName: true,
                            lastName: true,
                            avatar: {
                                select: {
                                    url: true,
                                },
                            },
                        },
                    },
                    lastMessage: true,
                },
            });
            if (!fullConversation) {
                throw new common_1.NotFoundException('Conversation not found');
            }
            return this.mapConversationToDto(fullConversation, userId);
        });
    }
    async getConversations(query, userId) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const skip = (page - 1) * limit;
        const where = {
            OR: [{ sellerId: userId }, { buyerId: userId }],
            deletedAt: null,
            ...(query.archived !== undefined && {
                OR: [
                    { sellerId: userId, isArchivedBySeller: query.archived },
                    { buyerId: userId, isArchivedByBuyer: query.archived },
                ],
            }),
            ...(query.orderId && { orderId: query.orderId }),
            ...(query.productId && { productId: query.productId }),
        };
        const [conversations, total] = await Promise.all([
            this.conversationRepository.findMany(where, {
                seller: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                        avatar: {
                            select: {
                                url: true,
                            },
                        },
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                        avatar: {
                            select: {
                                url: true,
                            },
                        },
                    },
                },
                lastMessage: true,
            }, { lastMessageAt: 'desc' }, limit, skip),
            this.conversationRepository.count(where),
        ]);
        return {
            data: conversations.map((conv) => this.mapConversationToDto(conv, userId)),
            total,
            page,
            limit,
        };
    }
    async getConversationById(id, userId) {
        const conversation = await this.conversationRepository.findById(id, {
            seller: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            buyer: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            lastMessage: true,
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        return this.mapConversationToDto(conversation, userId);
    }
    async sendMessage(dto, userId) {
        return this.prisma.$transaction(async (tx) => {
            return this.sendMessageInternal(dto, userId, tx);
        });
    }
    async sendMessageInternal(dto, userId, tx) {
        const conversation = await tx.conversation.findUnique({
            where: { id: dto.conversationId },
            include: {
                seller: true,
                buyer: true,
            },
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        if (conversation.deletedAt) {
            throw new common_1.BadRequestException('Conversation has been deleted');
        }
        const isSeller = conversation.sellerId === userId;
        const isBlocked = isSeller
            ? conversation.isBlockedByBuyer
            : conversation.isBlockedBySeller;
        if (isBlocked) {
            throw new common_1.ForbiddenException('You are blocked in this conversation');
        }
        if (dto.fileId) {
            const file = await tx.file.findUnique({
                where: { id: dto.fileId },
            });
            if (!file) {
                throw new common_1.NotFoundException('File not found');
            }
            if (file.uploadedById !== userId) {
                throw new common_1.ForbiddenException('You can only send files you uploaded');
            }
        }
        if (dto.replyToMessageId) {
            const replyToMessage = await tx.message.findUnique({
                where: { id: dto.replyToMessageId },
            });
            if (!replyToMessage) {
                throw new common_1.NotFoundException('Message to reply to not found');
            }
            if (replyToMessage.conversationId !== dto.conversationId) {
                throw new common_1.BadRequestException('Reply message must be from the same conversation');
            }
        }
        const message = await tx.message.create({
            data: {
                conversation: { connect: { id: dto.conversationId } },
                sender: { connect: { id: userId } },
                messageType: dto.messageType || client_1.MessageType.TEXT,
                content: dto.content,
                ...(dto.fileId && { file: { connect: { id: dto.fileId } } }),
                ...(dto.replyToMessageId && {
                    replyTo: { connect: { id: dto.replyToMessageId } },
                }),
                deliveryStatus: client_1.DeliveryStatus.SENT,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                        avatar: {
                            select: {
                                url: true,
                            },
                        },
                    },
                },
                file: {
                    select: {
                        id: true,
                        url: true,
                        filename: true,
                        mimeType: true,
                        size: true,
                    },
                },
            },
        });
        await tx.conversation.update({
            where: { id: dto.conversationId },
            data: {
                lastMessageId: message.id,
                lastMessageAt: message.createdAt,
                ...(isSeller
                    ? { unreadCountByBuyer: { increment: 1 } }
                    : { unreadCountBySeller: { increment: 1 } }),
            },
        });
        return this.mapMessageToDto(message);
    }
    async getMessages(conversationId, query, userId) {
        const conversation = await this.conversationRepository.findById(conversationId, {
            seller: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            buyer: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            lastMessage: true,
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        const limit = Math.min(query.limit || 50, 100);
        let cursorCreatedAt;
        if (query.cursor) {
            const cursorMessage = await this.messageRepository.findById(query.cursor);
            if (cursorMessage) {
                cursorCreatedAt = cursorMessage.createdAt;
            }
        }
        const where = {
            conversationId,
            isDeleted: false,
            ...(cursorCreatedAt && {
                createdAt: {
                    lt: cursorCreatedAt,
                },
            }),
        };
        const messages = await this.messageRepository.findMany(where, {
            sender: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            file: {
                select: {
                    id: true,
                    url: true,
                    filename: true,
                    mimeType: true,
                    size: true,
                },
            },
        }, { createdAt: 'desc' }, limit + 1);
        const hasMore = messages.length > limit;
        const data = hasMore ? messages.slice(0, -1) : messages;
        return {
            data: data
                .reverse()
                .map((msg) => this.mapMessageToDto(msg)),
            hasMore,
            nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
        };
    }
    async markMessagesAsRead(dto, userId) {
        const conversation = await this.conversationRepository.findById(dto.conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        const result = await this.messageRepository.markAsRead(dto.conversationId, userId, dto.messageIds);
        const isSeller = conversation.sellerId === userId;
        const unreadCount = isSeller
            ? conversation.unreadCountBySeller
            : conversation.unreadCountByBuyer;
        if (unreadCount > 0) {
            await this.conversationRepository.update({ id: dto.conversationId }, {
                ...(isSeller
                    ? { unreadCountBySeller: Math.max(0, unreadCount - result.count) }
                    : { unreadCountByBuyer: Math.max(0, unreadCount - result.count) }),
            });
        }
        await this.conversationRepository.updateLastSeen(dto.conversationId, isSeller, new Date());
        return result;
    }
    async updateConversation(id, dto, userId) {
        const conversation = await this.conversationRepository.findById(id);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        const isSeller = conversation.sellerId === userId;
        const updateData = {};
        if (dto.isArchived !== undefined) {
            updateData[isSeller ? 'isArchivedBySeller' : 'isArchivedByBuyer'] =
                dto.isArchived;
        }
        if (dto.isBlocked !== undefined) {
            updateData[isSeller ? 'isBlockedBySeller' : 'isBlockedByBuyer'] =
                dto.isBlocked;
        }
        await this.conversationRepository.update({ id }, updateData);
        const updated = await this.conversationRepository.findById(id, {
            seller: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            buyer: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            lastMessage: true,
        });
        if (!updated) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return this.mapConversationToDto(updated, userId);
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own messages');
        }
        if (message.isDeleted) {
            throw new common_1.BadRequestException('Message is already deleted');
        }
        await this.messageRepository.update({ id: messageId }, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: userId,
            content: 'This message was deleted',
        });
        const messageWithRelations = await this.messageRepository.findById(messageId, {
            sender: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            file: {
                select: {
                    id: true,
                    url: true,
                    filename: true,
                    mimeType: true,
                    size: true,
                },
            },
        });
        if (!messageWithRelations) {
            throw new common_1.NotFoundException('Message not found after update');
        }
        return this.mapMessageToDto(messageWithRelations);
    }
    async editMessage(messageId, content, userId) {
        if (content.length > 5000) {
            throw new common_1.BadRequestException('Message content too long');
        }
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own messages');
        }
        if (message.isDeleted) {
            throw new common_1.BadRequestException('Cannot edit deleted message');
        }
        await this.messageRepository.update({ id: messageId }, {
            content,
            isEdited: true,
            editedAt: new Date(),
        });
        const messageWithRelations = await this.messageRepository.findById(messageId, {
            sender: {
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    avatar: {
                        select: {
                            url: true,
                        },
                    },
                },
            },
            file: {
                select: {
                    id: true,
                    url: true,
                    filename: true,
                    mimeType: true,
                    size: true,
                },
            },
        });
        if (!messageWithRelations) {
            throw new common_1.NotFoundException('Message not found after update');
        }
        return this.mapMessageToDto(messageWithRelations);
    }
    async getUnreadCount(conversationId, userId) {
        const conversation = await this.conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this conversation');
        }
        const isSeller = conversation.sellerId === userId;
        const count = isSeller
            ? conversation.unreadCountBySeller
            : conversation.unreadCountByBuyer;
        return { count };
    }
    async getTotalUnreadCount(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                OR: [{ sellerId: userId }, { buyerId: userId }],
                deletedAt: null,
            },
            select: {
                sellerId: true,
                buyerId: true,
                unreadCountBySeller: true,
                unreadCountByBuyer: true,
            },
        });
        const total = conversations.reduce((sum, conv) => {
            const isSeller = conv.sellerId === userId;
            return (sum + (isSeller ? conv.unreadCountBySeller : conv.unreadCountByBuyer));
        }, 0);
        return { count: total };
    }
    async getStatistics(userId) {
        const [conversations, unreadCount, messagesCount] = await Promise.all([
            this.prisma.conversation.findMany({
                where: {
                    OR: [{ sellerId: userId }, { buyerId: userId }],
                    deletedAt: null,
                },
                select: {
                    sellerId: true,
                    buyerId: true,
                    isArchivedBySeller: true,
                    isArchivedByBuyer: true,
                    unreadCountBySeller: true,
                    unreadCountByBuyer: true,
                },
            }),
            this.getTotalUnreadCount(userId),
            this.prisma.message.count({
                where: {
                    conversation: {
                        OR: [{ sellerId: userId }, { buyerId: userId }],
                        deletedAt: null,
                    },
                    deletedAt: null,
                },
            }),
        ]);
        const archived = conversations.filter((conv) => {
            const isSeller = conv.sellerId === userId;
            return isSeller ? conv.isArchivedBySeller : conv.isArchivedByBuyer;
        }).length;
        return {
            totalConversations: conversations.length,
            unreadMessages: unreadCount.count,
            archivedConversations: archived,
            totalMessages: messagesCount,
        };
    }
    mapConversationToDto(conversation, userId) {
        const isSeller = conversation.sellerId === userId;
        return {
            id: conversation.id,
            seller: {
                id: conversation.seller.id,
                phoneNumber: conversation.seller.phoneNumber,
                firstName: conversation.seller.firstName,
                lastName: conversation.seller.lastName,
                avatarUrl: conversation.seller.avatar?.url || null,
            },
            buyer: {
                id: conversation.buyer.id,
                phoneNumber: conversation.buyer.phoneNumber,
                firstName: conversation.buyer.firstName,
                lastName: conversation.buyer.lastName,
                avatarUrl: conversation.buyer.avatar?.url || null,
            },
            orderId: conversation.orderId,
            productId: conversation.productId,
            unreadCount: isSeller
                ? conversation.unreadCountBySeller
                : conversation.unreadCountByBuyer,
            isArchived: isSeller
                ? conversation.isArchivedBySeller
                : conversation.isArchivedByBuyer,
            isBlocked: isSeller
                ? conversation.isBlockedByBuyer
                : conversation.isBlockedBySeller,
            lastMessageAt: conversation.lastMessageAt,
            lastMessage: conversation.lastMessage
                ? {
                    id: conversation.lastMessage.id,
                    content: conversation.lastMessage.content,
                    messageType: conversation.lastMessage.messageType,
                    createdAt: conversation.lastMessage.createdAt,
                    isRead: conversation.lastMessage.isRead,
                }
                : null,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    mapMessageToDto(message) {
        return {
            id: message.id,
            conversationId: message.conversationId,
            sender: {
                id: message.sender.id,
                phoneNumber: message.sender.phoneNumber,
                firstName: message.sender.firstName,
                lastName: message.sender.lastName,
                avatarUrl: message.sender.avatar?.url || null,
            },
            replyToMessageId: message.replyToMessageId,
            messageType: message.messageType,
            content: message.content,
            file: message.file
                ? {
                    id: message.file.id,
                    url: message.file.url,
                    filename: message.file.filename,
                    mimeType: message.file.mimeType,
                    size: message.file.size,
                }
                : null,
            deliveryStatus: message.deliveryStatus,
            isRead: message.isRead,
            readAt: message.readAt,
            isEdited: message.isEdited,
            editedAt: message.editedAt,
            isDeleted: message.isDeleted,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_repository_1.ConversationRepository,
        message_repository_1.MessageRepository,
        prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map