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
exports.UpdateConversationDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class UpdateConversationDto {
    isArchived;
    isBlocked;
    static _OPENAPI_METADATA_FACTORY() {
        return { isArchived: { required: false, type: () => Boolean }, isBlocked: { required: false, type: () => Boolean } };
    }
}
exports.UpdateConversationDto = UpdateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Archive/unarchive conversation',
        example: true,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateConversationDto.prototype, "isArchived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Block/unblock user in conversation',
        example: false,
        required: false,
    }),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateConversationDto.prototype, "isBlocked", void 0);
//# sourceMappingURL=update-conversation.dto.js.map