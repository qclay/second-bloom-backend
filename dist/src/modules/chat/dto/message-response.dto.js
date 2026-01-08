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
exports.MessageResponseDto = exports.MessageFileDto = exports.MessageSenderDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class MessageSenderDto {
    id;
    phoneNumber;
    firstName;
    lastName;
    avatarUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, firstName: { required: false, type: () => String, nullable: true }, lastName: { required: false, type: () => String, nullable: true }, avatarUrl: { required: false, type: () => String, nullable: true } };
    }
}
exports.MessageSenderDto = MessageSenderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], MessageSenderDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+998901234567' }),
    __metadata("design:type", String)
], MessageSenderDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', required: false }),
    __metadata("design:type", Object)
], MessageSenderDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', required: false }),
    __metadata("design:type", Object)
], MessageSenderDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/avatar.jpg', required: false }),
    __metadata("design:type", Object)
], MessageSenderDto.prototype, "avatarUrl", void 0);
class MessageFileDto {
    id;
    url;
    filename;
    mimeType;
    size;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, url: { required: true, type: () => String }, filename: { required: true, type: () => String }, mimeType: { required: true, type: () => String }, size: { required: true, type: () => Number } };
    }
}
exports.MessageFileDto = MessageFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], MessageFileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/file.jpg' }),
    __metadata("design:type", String)
], MessageFileDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image.jpg' }),
    __metadata("design:type", String)
], MessageFileDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    __metadata("design:type", String)
], MessageFileDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024000 }),
    __metadata("design:type", Number)
], MessageFileDto.prototype, "size", void 0);
class MessageResponseDto {
    id;
    conversationId;
    sender;
    replyToMessageId;
    messageType;
    content;
    file;
    deliveryStatus;
    isRead;
    readAt;
    isEdited;
    editedAt;
    isDeleted;
    createdAt;
    updatedAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, conversationId: { required: true, type: () => String }, sender: { required: true, type: () => require("./message-response.dto").MessageSenderDto }, replyToMessageId: { required: false, type: () => String, nullable: true }, messageType: { required: true, type: () => String }, content: { required: true, type: () => String }, file: { required: false, type: () => require("./message-response.dto").MessageFileDto, nullable: true }, deliveryStatus: { required: true, type: () => String }, isRead: { required: true, type: () => Boolean }, readAt: { required: false, type: () => Date, nullable: true }, isEdited: { required: true, type: () => Boolean }, editedAt: { required: false, type: () => Date, nullable: true }, isDeleted: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.MessageResponseDto = MessageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: MessageSenderDto }),
    __metadata("design:type", MessageSenderDto)
], MessageResponseDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hello, is this available?', required: false }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "replyToMessageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TEXT' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hello, is this available?' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: MessageFileDto, required: false }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "file", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SENT' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "deliveryStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z', required: false }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "isEdited", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z', required: false }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "editedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "isDeleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    __metadata("design:type", Date)
], MessageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z' }),
    __metadata("design:type", Date)
], MessageResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=message-response.dto.js.map