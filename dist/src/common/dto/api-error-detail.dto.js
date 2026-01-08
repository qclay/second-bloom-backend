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
exports.ApiErrorDetailDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ApiErrorDetailDto {
    field;
    message;
    code;
    value;
    static _OPENAPI_METADATA_FACTORY() {
        return { field: { required: false, type: () => String }, message: { required: true, type: () => String }, code: { required: true, type: () => String }, value: { required: false, type: () => Object } };
    }
}
exports.ApiErrorDetailDto = ApiErrorDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'email',
        required: false,
        description: 'Field or parameter that caused the error',
        type: String,
    }),
    __metadata("design:type", String)
], ApiErrorDetailDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Invalid email format',
        description: 'Human-readable error message for this specific field',
        type: String,
    }),
    __metadata("design:type", String)
], ApiErrorDetailDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'INVALID_FORMAT',
        description: 'Machine-readable error code for this specific error',
        type: String,
    }),
    __metadata("design:type", String)
], ApiErrorDetailDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'invalid-email',
        required: false,
        description: 'The invalid value that was provided',
        type: String,
    }),
    __metadata("design:type", Object)
], ApiErrorDetailDto.prototype, "value", void 0);
//# sourceMappingURL=api-error-detail.dto.js.map