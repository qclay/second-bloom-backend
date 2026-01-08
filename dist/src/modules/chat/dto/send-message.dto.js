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
exports.SendMessageDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class SendMessageDto {
    conversationId;
    content;
    messageType = client_1.MessageType.TEXT;
    fileId;
    replyToMessageId;
    static _OPENAPI_METADATA_FACTORY() {
        return { conversationId: { required: true, type: () => String, format: "uuid" }, content: { required: true, type: () => String, maxLength: 5000 }, messageType: { required: false, type: () => Object, default: client_1.MessageType.TEXT }, fileId: { required: false, type: () => String, format: "uuid" }, replyToMessageId: { required: false, type: () => String, format: "uuid" } };
    }
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conversation ID',
        example: 'clx1234567890abcdef',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message content',
        example: 'Hello, is this product still available?',
        maxLength: 5000,
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message type',
        enum: client_1.MessageType,
        example: client_1.MessageType.TEXT,
        default: client_1.MessageType.TEXT,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(client_1.MessageType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File ID for attachments (images, files)',
        example: 'clx1234567890abcdef',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of message being replied to',
        example: 'clx1234567890abcdef',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "replyToMessageId", void 0);
//# sourceMappingURL=send-message.dto.js.map