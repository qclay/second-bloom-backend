"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCommonErrorResponses = ApiCommonErrorResponses;
exports.ApiAuthErrorResponses = ApiAuthErrorResponses;
exports.ApiPublicErrorResponses = ApiPublicErrorResponses;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_error_response_dto_1 = require("../dto/api-error-response.dto");
function ApiCommonErrorResponses(options) {
    const { badRequest = true, unauthorized = true, forbidden = true, notFound = true, conflict = false, internalServerError = true, } = options || {};
    const decorators = [];
    if (badRequest) {
        decorators.push((0, swagger_1.ApiResponse)({
            status: 400,
            description: 'Bad Request - Invalid input data or validation failed',
            type: api_error_response_dto_1.ApiErrorResponseDto,
        }));
    }
    if (unauthorized) {
        decorators.push((0, swagger_1.ApiResponse)({
            status: 401,
            description: 'Unauthorized - Authentication required or token invalid',
            type: api_error_response_dto_1.ApiErrorResponseDto,
        }));
    }
    if (forbidden) {
        decorators.push((0, swagger_1.ApiResponse)({
            status: 403,
            description: 'Forbidden - Insufficient permissions',
            type: api_error_response_dto_1.ApiErrorResponseDto,
        }));
    }
    if (notFound) {
        decorators.push((0, swagger_1.ApiResponse)({
            status: 404,
            description: 'Not Found - Resource does not exist',
            type: api_error_response_dto_1.ApiErrorResponseDto,
        }));
    }
    if (conflict) {
        decorators.push((0, swagger_1.ApiResponse)({
            status: 409,
            description: 'Conflict - Resource already exists or state conflict',
            type: api_error_response_dto_1.ApiErrorResponseDto,
        }));
    }
    if (internalServerError) {
        decorators.push((0, swagger_1.ApiResponse)({
            status: 500,
            description: 'Internal Server Error - Unexpected server error',
            type: api_error_response_dto_1.ApiErrorResponseDto,
        }));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
function ApiAuthErrorResponses() {
    return ApiCommonErrorResponses({
        badRequest: false,
        unauthorized: true,
        forbidden: true,
        notFound: false,
        conflict: false,
        internalServerError: false,
    });
}
function ApiPublicErrorResponses() {
    return ApiCommonErrorResponses({
        badRequest: true,
        unauthorized: false,
        forbidden: false,
        notFound: true,
        conflict: false,
        internalServerError: false,
    });
}
//# sourceMappingURL=api-error-responses.decorator.js.map