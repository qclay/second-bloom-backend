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
exports.ApiSuccessResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ApiSuccessResponseDto {
    success;
    statusCode;
    message;
    data;
    timestamp;
    path;
    requestId;
    meta;
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, statusCode: { required: true, type: () => Number }, message: { required: false, type: () => String }, data: { required: true, nullable: true }, timestamp: { required: true, type: () => String }, path: { required: false, type: () => String }, requestId: { required: false, type: () => String } };
    }
}
exports.ApiSuccessResponseDto = ApiSuccessResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indicates if the request was successful',
        type: Boolean,
    }),
    __metadata("design:type", Boolean)
], ApiSuccessResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 200,
        description: 'HTTP status code',
        type: Number,
        minimum: 200,
        maximum: 299,
    }),
    __metadata("design:type", Number)
], ApiSuccessResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Resource retrieved successfully',
        required: false,
        description: 'Human-readable success message',
        type: String,
    }),
    __metadata("design:type", String)
], ApiSuccessResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The response payload data',
        nullable: true,
        example: null,
    }),
    __metadata("design:type", Object)
], ApiSuccessResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-01-04T17:15:29.000Z',
        description: 'Response timestamp in ISO 8601 format',
        type: String,
        format: 'date-time',
    }),
    __metadata("design:type", String)
], ApiSuccessResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '/api/v1/users/123',
        required: false,
        description: 'The request path',
        type: String,
    }),
    __metadata("design:type", String)
], ApiSuccessResponseDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
        description: 'Request ID for tracking and debugging',
        type: String,
        format: 'uuid',
    }),
    __metadata("design:type", String)
], ApiSuccessResponseDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Pagination metadata (only present for paginated responses)',
        example: {
            pagination: {
                page: 1,
                limit: 20,
                total: 100,
                totalPages: 5,
                hasNextPage: true,
                hasPreviousPage: false,
            },
        },
    }),
    __metadata("design:type", Object)
], ApiSuccessResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=api-success-response.dto.js.map