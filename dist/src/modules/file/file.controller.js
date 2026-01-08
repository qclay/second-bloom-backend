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
exports.FileController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const throttler_1 = require("@nestjs/throttler");
const file_service_1 = require("./file.service");
const file_query_dto_1 = require("./dto/file-query.dto");
const file_response_dto_1 = require("./dto/file-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const file_validation_interceptor_1 = require("./interceptors/file-validation.interceptor");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let FileController = class FileController {
    fileService;
    constructor(fileService) {
        this.fileService = fileService;
    }
    async uploadFile(file, user) {
        console.log(user.id);
        return this.fileService.uploadFile(file, user.id);
    }
    async findAll(query, user) {
        return this.fileService.findAll(query, user?.id);
    }
    async findOne(id, user) {
        return this.fileService.findById(id, user?.id);
    }
    async getSignedUrl(id, expiresIn, user) {
        const expiresInSeconds = expiresIn ? parseInt(expiresIn, 10) : 3600;
        const url = await this.fileService.getSignedUrl(id, user?.id, expiresInSeconds);
        return { url };
    }
    async remove(id, user) {
        return this.fileService.deleteFile(id, user.id);
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ short: { ttl: 60000, limit: 10 } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 100 * 1024 * 1024,
        },
    }), file_validation_interceptor_1.FileValidationInterceptor),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (images, documents, videos, etc.)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded successfully',
        type: file_response_dto_1.FileResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: require("./dto/file-response.dto").FileResponseDto }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all files' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ notFound: false, conflict: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of files' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_query_dto_1.FileQueryDto, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File details',
        type: file_response_dto_1.FileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/file-response.dto").FileResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/signed-url'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get signed URL for file access',
        description: 'Generates a temporary signed URL for accessing a private file. The URL expires after the specified time (default: 1 hour).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Signed URL generated successfully',
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    example: 'https://s3.amazonaws.com/bucket/file.jpg?X-Amz-Signature=...',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Access denied to this file',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'File not found',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('expiresIn')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getSignedUrl", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a file' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'File deleted' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "remove", null);
exports.FileController = FileController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map