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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const conversation_query_dto_1 = require("./dto/conversation-query.dto");
const message_query_dto_1 = require("./dto/message-query.dto");
const update_conversation_dto_1 = require("./dto/update-conversation.dto");
const conversation_response_dto_1 = require("./dto/conversation-response.dto");
const message_response_dto_1 = require("./dto/message-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const sanitize_pipe_1 = require("../../common/pipes/sanitize.pipe");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createConversation(createConversationDto, userId) {
        return this.chatService.createConversation(createConversationDto, userId);
    }
    async getConversations(query, userId) {
        return this.chatService.getConversations(query, userId);
    }
    async getConversationById(id, userId) {
        return this.chatService.getConversationById(id, userId);
    }
    async updateConversation(id, updateConversationDto, userId) {
        return this.chatService.updateConversation(id, updateConversationDto, userId);
    }
    async getMessages(conversationId, query, userId) {
        return this.chatService.getMessages(conversationId, query, userId);
    }
    async getUnreadCount(conversationId, userId) {
        return await this.chatService.getUnreadCount(conversationId, userId);
    }
    async getTotalUnreadCount(userId) {
        return await this.chatService.getTotalUnreadCount(userId);
    }
    async getStatistics(userId) {
        return await this.chatService.getStatistics(userId);
    }
    async deleteMessage(id, userId) {
        return this.chatService.deleteMessage(id, userId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('conversations'),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new conversation' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: true }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Conversation created successfully',
        type: conversation_response_dto_1.ConversationResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: require("./dto/conversation-response.dto").ConversationResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all conversations for current user' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ notFound: false, conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of conversations',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [conversation_query_dto_1.ConversationQueryDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation details',
        type: conversation_response_dto_1.ConversationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/conversation-response.dto").ConversationResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversationById", null);
__decorate([
    (0, common_1.Patch)('conversations/:id'),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, swagger_1.ApiOperation)({ summary: 'Update conversation (archive, block)' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conversation updated',
        type: conversation_response_dto_1.ConversationResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/conversation-response.dto").ConversationResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_conversation_dto_1.UpdateConversationDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages in a conversation' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of messages',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_query_dto_1.MessageQueryDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread message count for a conversation' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread message count',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get total unread message count across all conversations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Total unread message count',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getTotalUnreadCount", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chat statistics for current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Chat statistics',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a message' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message deleted',
        type: message_response_dto_1.MessageResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/message-response.dto").MessageResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map