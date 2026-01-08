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
exports.MarkMessagesReadDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class MarkMessagesReadDto {
    conversationId;
    messageIds;
    static _OPENAPI_METADATA_FACTORY() {
        return { conversationId: { required: true, type: () => String, format: "uuid" }, messageIds: { required: false, type: () => [String], format: "uuid" } };
    }
}
exports.MarkMessagesReadDto = MarkMessagesReadDto;
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
], MarkMessagesReadDto.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Specific message IDs to mark as read (optional, if not provided, marks all as read)',
        example: ['clx1234567890abcdef', 'clx0987654321fedcba'],
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MarkMessagesReadDto.prototype, "messageIds", void 0);
//# sourceMappingURL=mark-messages-read.dto.js.map