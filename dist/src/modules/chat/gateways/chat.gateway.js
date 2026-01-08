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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const chat_service_1 = require("../chat.service");
const send_message_dto_1 = require("../dto/send-message.dto");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    jwtService;
    configService;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    userSockets = new Map();
    constructor(chatService, jwtService, configService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async handleConnection(client) {
        try {
            const token = this.extractTokenFromSocket(client);
            if (!token) {
                this.logger.warn(`Client ${client.id} disconnected: No token provided`);
                client.disconnect();
                return;
            }
            const jwtSecret = this.configService.get('JWT_SECRET');
            if (!jwtSecret) {
                throw new Error('JWT_SECRET is not configured');
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtSecret,
            });
            const userId = payload.sub || payload.id;
            if (!userId || typeof userId !== 'string') {
                throw new Error('Invalid user ID in token');
            }
            client.userId = userId;
            this.addUserSocket(client.userId, client.id);
            this.logger.log(`Client ${client.id} connected as user ${client.userId}`);
            client.emit('connected', { userId: client.userId });
        }
        catch (error) {
            this.logger.warn(`Client ${client.id} disconnected: Invalid token - ${error instanceof Error ? error.message : 'Unknown error'}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.removeUserSocket(client.userId, client.id);
            this.logger.log(`Client ${client.id} disconnected (user ${client.userId})`);
        }
    }
    async handleJoinConversation(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        if (!data.conversationId || typeof data.conversationId !== 'string') {
            return { error: 'Invalid conversation ID' };
        }
        try {
            await this.chatService.getConversationById(data.conversationId, client.userId);
            void client.join(`conversation:${data.conversationId}`);
            this.logger.log(`User ${client.userId} joined conversation ${data.conversationId}`);
            return { success: true, conversationId: data.conversationId };
        }
        catch (error) {
            this.logger.error(`Error joining conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    handleLeaveConversation(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        void client.leave(`conversation:${data.conversationId}`);
        this.logger.log(`User ${client.userId} left conversation ${data.conversationId}`);
        return { success: true, conversationId: data.conversationId };
    }
    async handleSendMessage(client, data) {
        if (!client.userId) {
            return { success: false, error: 'Unauthorized' };
        }
        if (!data.conversationId || !data.content) {
            return { success: false, error: 'Missing required fields' };
        }
        if (data.content.length > 5000) {
            return { success: false, error: 'Message content too long' };
        }
        try {
            const message = await this.chatService.sendMessage(data, client.userId);
            const conversation = await this.chatService.getConversationById(data.conversationId, client.userId);
            const recipientId = conversation.seller.id === client.userId
                ? conversation.buyer.id
                : conversation.seller.id;
            this.server
                .to(`conversation:${data.conversationId}`)
                .emit('new_message', message);
            this.sendToUser(recipientId, 'new_message', message);
            this.logger.log(`Message sent in conversation ${data.conversationId} by user ${client.userId}`);
            return { success: true, message };
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    handleTypingStart(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        if (!data.conversationId || typeof data.conversationId !== 'string') {
            return { error: 'Invalid conversation ID' };
        }
        client.to(`conversation:${data.conversationId}`).emit('user_typing', {
            conversationId: data.conversationId,
            userId: client.userId,
            isTyping: true,
        });
        return { success: true };
    }
    handleTypingStop(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        if (!data.conversationId || typeof data.conversationId !== 'string') {
            return { error: 'Invalid conversation ID' };
        }
        client.to(`conversation:${data.conversationId}`).emit('user_typing', {
            conversationId: data.conversationId,
            userId: client.userId,
            isTyping: false,
        });
        return { success: true };
    }
    async handleMarkRead(client, data) {
        if (!client.userId) {
            return { error: 'Unauthorized' };
        }
        if (!data.conversationId || typeof data.conversationId !== 'string') {
            return { error: 'Invalid conversation ID' };
        }
        try {
            const result = await this.chatService.markMessagesAsRead({
                conversationId: data.conversationId,
                messageIds: data.messageIds,
            }, client.userId);
            this.server
                .to(`conversation:${data.conversationId}`)
                .emit('messages_read', {
                conversationId: data.conversationId,
                userId: client.userId,
                count: result.count,
            });
            return { success: true, count: result.count };
        }
        catch (error) {
            this.logger.error(`Error marking messages as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async handleDeleteMessage(client, data) {
        if (!client.userId) {
            return { success: false, error: 'Unauthorized' };
        }
        if (!data.messageId || typeof data.messageId !== 'string') {
            return { success: false, error: 'Invalid message ID' };
        }
        try {
            const message = await this.chatService.deleteMessage(data.messageId, client.userId);
            const conversation = await this.chatService.getConversationById(message.conversationId, client.userId);
            const recipientId = conversation.seller.id === client.userId
                ? conversation.buyer.id
                : conversation.seller.id;
            this.server
                .to(`conversation:${message.conversationId}`)
                .emit('message_deleted', {
                messageId: message.id,
                conversationId: message.conversationId,
            });
            this.sendToUser(recipientId, 'message_deleted', {
                messageId: message.id,
                conversationId: message.conversationId,
            });
            this.logger.log(`Message ${data.messageId} deleted by user ${client.userId}`);
            return { success: true, message };
        }
        catch (error) {
            this.logger.error(`Error deleting message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async handleEditMessage(client, data) {
        if (!client.userId) {
            return { success: false, error: 'Unauthorized' };
        }
        if (!data.messageId || !data.content) {
            return { success: false, error: 'Missing required fields' };
        }
        if (data.content.length > 5000) {
            return { success: false, error: 'Message content too long' };
        }
        try {
            const message = await this.chatService.editMessage(data.messageId, data.content, client.userId);
            const conversation = await this.chatService.getConversationById(message.conversationId, client.userId);
            const recipientId = conversation.seller.id === client.userId
                ? conversation.buyer.id
                : conversation.seller.id;
            this.server
                .to(`conversation:${message.conversationId}`)
                .emit('message_edited', message);
            this.sendToUser(recipientId, 'message_edited', message);
            this.logger.log(`Message ${data.messageId} edited by user ${client.userId}`);
            return { success: true, message };
        }
        catch (error) {
            this.logger.error(`Error editing message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    notifyNewMessage(conversationId, message, recipientId) {
        this.sendToUser(recipientId, 'new_message', message);
        this.server
            .to(`conversation:${conversationId}`)
            .emit('new_message', message);
    }
    notifyMessageRead(conversationId, userId, count) {
        this.server.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            userId,
            count,
        });
    }
    sendToUser(userId, event, data) {
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }
    addUserSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)?.add(socketId);
    }
    removeUserSocket(userId, socketId) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }
    extractTokenFromSocket(client) {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        const token = client.handshake.auth?.token;
        if (token) {
            return token;
        }
        const queryToken = client.handshake.query?.token;
        if (queryToken && typeof queryToken === 'string') {
            return queryToken;
        }
        return null;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('edit_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEditMessage", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        config_1.ConfigService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map