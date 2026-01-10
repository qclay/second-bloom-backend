"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSuccessResponse = ApiSuccessResponse;
exports.ApiPaginatedResponse = ApiPaginatedResponse;
const swagger_1 = require("@nestjs/swagger");
const api_success_response_dto_1 = require("../dto/api-success-response.dto");
const pagination_meta_dto_1 = require("../dto/pagination-meta.dto");
function ApiSuccessResponse(status = 200, description, dataType, isPaginated = false) {
    const defaultDescriptions = {
        200: 'Request successful',
        201: 'Resource created successfully',
        204: 'Request processed successfully',
    };
    const responseDescription = description || defaultDescriptions[status] || 'Request successful';
    if (isPaginated && dataType) {
        return (0, swagger_1.ApiResponse)({
            status,
            description: responseDescription,
            schema: {
                allOf: [
                    { $ref: (0, swagger_1.getSchemaPath)(api_success_response_dto_1.ApiSuccessResponseDto) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: (0, swagger_1.getSchemaPath)(dataType) },
                            },
                            meta: {
                                type: 'object',
                                properties: {
                                    pagination: {
                                        $ref: (0, swagger_1.getSchemaPath)(pagination_meta_dto_1.PaginationMetaDto),
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        });
    }
    if (dataType) {
        return (0, swagger_1.ApiResponse)({
            status,
            description: responseDescription,
            schema: {
                allOf: [
                    { $ref: (0, swagger_1.getSchemaPath)(api_success_response_dto_1.ApiSuccessResponseDto) },
                    {
                        properties: {
                            data: {
                                oneOf: [
                                    { $ref: (0, swagger_1.getSchemaPath)(dataType) },
                                    { type: 'array', items: { $ref: (0, swagger_1.getSchemaPath)(dataType) } },
                                ],
                            },
                        },
                    },
                ],
            },
        });
    }
    return (0, swagger_1.ApiResponse)({
        status,
        description: responseDescription,
        type: api_success_response_dto_1.ApiSuccessResponseDto,
    });
}
function ApiPaginatedResponse(dataType, description, status = 200) {
    return ApiSuccessResponse(status, description, dataType, true);
}
//# sourceMappingURL=api-success-responses.decorator.js.map