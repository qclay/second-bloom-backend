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
exports.ConversationResponseDto = exports.ConversationLastMessageDto = exports.ConversationParticipantDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ConversationParticipantDto {
    id;
    phoneNumber;
    firstName;
    lastName;
    avatarUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, firstName: { required: false, type: () => String, nullable: true }, lastName: { required: false, type: () => String, nullable: true }, avatarUrl: { required: false, type: () => String, nullable: true } };
    }
}
exports.ConversationParticipantDto = ConversationParticipantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], ConversationParticipantDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+998901234567' }),
    __metadata("design:type", String)
], ConversationParticipantDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', required: false }),
    __metadata("design:type", Object)
], ConversationParticipantDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', required: false }),
    __metadata("design:type", Object)
], ConversationParticipantDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/avatar.jpg', required: false }),
    __metadata("design:type", Object)
], ConversationParticipantDto.prototype, "avatarUrl", void 0);
class ConversationLastMessageDto {
    id;
    content;
    messageType;
    createdAt;
    isRead;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, content: { required: true, type: () => String }, messageType: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, isRead: { required: true, type: () => Boolean } };
    }
}
exports.ConversationLastMessageDto = ConversationLastMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], ConversationLastMessageDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hello, is this available?' }),
    __metadata("design:type", String)
], ConversationLastMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TEXT' }),
    __metadata("design:type", String)
], ConversationLastMessageDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    __metadata("design:type", Date)
], ConversationLastMessageDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ConversationLastMessageDto.prototype, "isRead", void 0);
class ConversationResponseDto {
    id;
    seller;
    buyer;
    orderId;
    productId;
    unreadCount;
    isArchived;
    isBlocked;
    lastMessageAt;
    lastMessage;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, seller: { required: true, type: () => require("./conversation-response.dto").ConversationParticipantDto }, buyer: { required: true, type: () => require("./conversation-response.dto").ConversationParticipantDto }, orderId: { required: false, type: () => String, nullable: true }, productId: { required: false, type: () => String, nullable: true }, unreadCount: { required: true, type: () => Number }, isArchived: { required: true, type: () => Boolean }, isBlocked: { required: true, type: () => Boolean }, lastMessageAt: { required: false, type: () => Date, nullable: true }, lastMessage: { required: false, type: () => require("./conversation-response.dto").ConversationLastMessageDto, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.ConversationResponseDto = ConversationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], ConversationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ConversationParticipantDto }),
    __metadata("design:type", ConversationParticipantDto)
], ConversationResponseDto.prototype, "seller", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ConversationParticipantDto }),
    __metadata("design:type", ConversationParticipantDto)
], ConversationResponseDto.prototype, "buyer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef', required: false }),
    __metadata("design:type", Object)
], ConversationResponseDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef', required: false }),
    __metadata("design:type", Object)
], ConversationResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], ConversationResponseDto.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ConversationResponseDto.prototype, "isArchived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ConversationResponseDto.prototype, "isBlocked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z', required: false }),
    __metadata("design:type", Object)
], ConversationResponseDto.prototype, "lastMessageAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ConversationLastMessageDto, required: false }),
    __metadata("design:type", Object)
], ConversationResponseDto.prototype, "lastMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    __metadata("design:type", Date)
], ConversationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    __metadata("design:type", Date)
], ConversationResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=conversation-response.dto.js.map