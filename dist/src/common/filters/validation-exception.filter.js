"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ValidationExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_codes_constant_1 = require("../constants/error-codes.constant");
let ValidationExceptionFilter = ValidationExceptionFilter_1 = class ValidationExceptionFilter {
    logger = new common_1.Logger(ValidationExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const exceptionResponse = exception.getResponse();
        let message = 'Validation failed';
        const errorDetails = [];
        if (exceptionResponse?.message &&
            Array.isArray(exceptionResponse.message)) {
            this.formatValidationErrors(exceptionResponse.message, errorDetails);
        }
        else if (exceptionResponse?.message) {
            message = String(exceptionResponse.message);
        }
        const errorResponse = {
            success: false,
            error: {
                code: error_codes_constant_1.ErrorCode.VALIDATION_FAILED,
                message,
                ...(errorDetails.length > 0 && { details: errorDetails }),
            },
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.id,
        };
        this.logger.warn(`${request.method} ${request.url} - Validation Error: ${message}`);
        response.status(common_1.HttpStatus.BAD_REQUEST).json(errorResponse);
    }
    formatValidationErrors(messages, errorDetails) {
        messages.forEach((message) => {
            const fieldMatch = message.match(/^(\w+)\s/);
            const field = fieldMatch ? fieldMatch[1] : undefined;
            errorDetails.push({
                ...(field && { field }),
                message,
                code: error_codes_constant_1.ErrorCode.VALIDATION_FAILED,
            });
        });
    }
};
exports.ValidationExceptionFilter = ValidationExceptionFilter;
exports.ValidationExceptionFilter = ValidationExceptionFilter = ValidationExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(common_1.BadRequestException)
], ValidationExceptionFilter);
//# sourceMappingURL=validation-exception.filter.js.map