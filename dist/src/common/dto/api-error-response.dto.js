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
exports.ApiErrorResponseDto = exports.ApiErrorObjectDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const api_error_detail_dto_1 = require("./api-error-detail.dto");
class ApiErrorObjectDto {
    code;
    message;
    details;
    documentation;
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String }, message: { required: true, type: () => String }, details: { required: false, type: () => [require("./api-error-detail.dto").ApiErrorDetailDto] }, documentation: { required: false, type: () => String } };
    }
}
exports.ApiErrorObjectDto = ApiErrorObjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'VALIDATION_FAILED',
        description: 'Machine-readable error code (similar to Stripe error types)',
        type: String,
    }),
    __metadata("design:type", String)
], ApiErrorObjectDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Validation failed',
        description: 'Human-readable error message',
        type: String,
    }),
    __metadata("design:type", String)
], ApiErrorObjectDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [api_error_detail_dto_1.ApiErrorDetailDto],
        required: false,
        description: 'Array of detailed error information',
        isArray: true,
        example: [
            {
                field: 'email',
                message: 'Invalid email format',
                code: 'INVALID_FORMAT',
            },
        ],
    }),
    __metadata("design:type", Array)
], ApiErrorObjectDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://docs.example.com/errors/validation-failed',
        required: false,
        description: 'Link to error documentation',
        type: String,
        format: 'uri',
    }),
    __metadata("design:type", String)
], ApiErrorObjectDto.prototype, "documentation", void 0);
class ApiErrorResponseDto {
    success;
    error;
    statusCode;
    timestamp;
    path;
    requestId;
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, error: { required: true, type: () => require("./api-error-response.dto").ApiErrorObjectDto }, statusCode: { required: true, type: () => Number }, timestamp: { required: true, type: () => String }, path: { required: true, type: () => String }, requestId: { required: false, type: () => String } };
    }
}
exports.ApiErrorResponseDto = ApiErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Indicates the request failed',
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], ApiErrorResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: ApiErrorObjectDto,
        description: 'Error object containing all error details',
    }),
    __metadata("design:type", ApiErrorObjectDto)
], ApiErrorResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 400,
        description: 'HTTP status code',
        type: Number,
        minimum: 400,
        maximum: 599,
    }),
    __metadata("design:type", Number)
], ApiErrorResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-01-04T17:15:29.000Z',
        description: 'Error timestamp in ISO 8601 format',
        type: String,
        format: 'date-time',
    }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/api/v1/users',
        description: 'The request path that caused the error',
        type: String,
    }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
        description: 'Request ID for tracking and debugging',
        type: String,
        format: 'uuid',
    }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "requestId", void 0);
//# sourceMappingURL=api-error-response.dto.js.map