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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const nest_winston_1 = require("nest-winston");
const sentry_service_1 = require("../services/sentry.service");
const error_codes_constant_1 = require("../constants/error-codes.constant");
const config_1 = require("@nestjs/config");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger;
    sentry;
    configService;
    constructor(logger, sentry, configService) {
        this.logger = logger;
        this.sentry = sentry;
        this.configService = configService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                message = responseObj.message || exception.message;
            }
            else {
                message = exception.message;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            status = this.handlePrismaError(exception);
            message = this.getPrismaErrorMessage(exception);
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = 'Database validation error';
        }
        else if (exception instanceof client_1.Prisma.PrismaClientInitializationError) {
            status = common_1.HttpStatus.SERVICE_UNAVAILABLE;
            message = 'Database connection error';
        }
        else if (exception instanceof client_1.Prisma.PrismaClientRustPanicError) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Database engine error';
        }
        else if (exception instanceof Error) {
            message = exception.message;
            if (process.env.NODE_ENV !== 'development') {
                const requestId = request.id;
                const userId = request.user
                    ?.id;
                const meta = {
                    context: 'AllExceptionsFilter',
                    stack: exception.stack,
                    requestId,
                    userId,
                    errorName: exception.name,
                };
                const errorMessage = `Unhandled error: ${exception.message} [RequestId: ${requestId}, Error: ${exception.name}]`;
                this.logger.error(`${errorMessage} ${JSON.stringify(meta)}`);
            }
        }
        const requestId = request.id;
        const userId = request.user?.id;
        const errorCode = exception?.code ||
            error_codes_constant_1.STATUS_TO_ERROR_CODE[status] ||
            error_codes_constant_1.ErrorCode.INTERNAL_SERVER_ERROR;
        const errorDetails = Array.isArray(message)
            ? message.map((msg) => ({
                message: msg,
                code: error_codes_constant_1.ErrorCode.VALIDATION_FAILED,
            }))
            : undefined;
        let errorMessage = Array.isArray(message) ? 'Validation failed' : message;
        let finalErrorCode = errorCode;
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR &&
            process.env.NODE_ENV === 'production') {
            errorMessage = 'An internal server error occurred';
            finalErrorCode = error_codes_constant_1.ErrorCode.INTERNAL_SERVER_ERROR;
        }
        const retryInfo = this.getRetryInfo(status);
        const errorResponse = {
            success: false,
            error: {
                code: finalErrorCode,
                message: errorMessage,
                ...(errorDetails &&
                    errorDetails.length > 0 && { details: errorDetails }),
                ...(this.getDocumentationUrl(finalErrorCode) && {
                    documentation: this.getDocumentationUrl(finalErrorCode),
                }),
            },
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId,
            ...(retryInfo && { retry: retryInfo }),
        };
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            const meta = {
                context: 'AllExceptionsFilter',
                stack: exception instanceof Error ? exception.stack : undefined,
                requestId,
                userId,
                method: request.method,
                url: request.url,
                status,
            };
            const errorMessage = `Internal server error - ${request.method} ${request.url} - ${status} - ${message}`;
            this.logger.error(`${errorMessage} ${JSON.stringify(meta)}`);
            this.sentry.captureException(exception, {
                requestId,
                userId,
                extra: {
                    method: request.method,
                    url: request.url,
                    status,
                    message,
                },
            });
        }
        else {
            this.logger.warn(`Client error - ${request.method} ${request.url} - ${status} - ${message} [RequestId: ${requestId}, UserId: ${userId}]`);
        }
        response.status(status).json(errorResponse);
    }
    handlePrismaError(error) {
        switch (error.code) {
            case 'P2002':
                return common_1.HttpStatus.CONFLICT;
            case 'P2025':
                return common_1.HttpStatus.NOT_FOUND;
            case 'P2003':
                return common_1.HttpStatus.BAD_REQUEST;
            case 'P2014':
                return common_1.HttpStatus.BAD_REQUEST;
            default:
                return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    getPrismaErrorMessage(error) {
        switch (error.code) {
            case 'P2002': {
                const target = error.meta?.target || [];
                return `Duplicate entry: ${target.join(', ')} already exists`;
            }
            case 'P2025':
                return 'Record not found';
            case 'P2003':
                return 'Invalid reference: related record does not exist';
            case 'P2014':
                return 'Required relation missing';
            default:
                return 'Database operation failed';
        }
    }
    getDocumentationUrl(errorCode) {
        const baseUrl = this.configService.get('API_DOCS_URL');
        if (!baseUrl)
            return undefined;
        return `${baseUrl}/errors/${errorCode}`;
    }
    getRetryInfo(status) {
        if (status === 429) {
            return {
                retryable: true,
                retryAfter: 60,
            };
        }
        if (status === 503) {
            return {
                retryable: true,
                retryAfter: 30,
            };
        }
        if (status >= 500 && status !== 500) {
            return {
                retryable: true,
            };
        }
        return undefined;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [nest_winston_1.WinstonLogger,
        sentry_service_1.SentryService,
        config_1.ConfigService])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map