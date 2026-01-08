"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationMeta = createPaginationMeta;
exports.createSuccessResponse = createSuccessResponse;
exports.createPaginatedResponse = createPaginatedResponse;
function createPaginationMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}
function createSuccessResponse(data, statusCode = 200, message, path, requestId) {
    return {
        success: true,
        statusCode,
        ...(message && { message }),
        data,
        timestamp: new Date().toISOString(),
        ...(path && { path }),
        ...(requestId && { requestId }),
    };
}
function createPaginatedResponse(data, page, limit, total, statusCode = 200, path, requestId) {
    const paginationMeta = createPaginationMeta(page, limit, total);
    return {
        success: true,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
        ...(path && { path }),
        ...(requestId && { requestId }),
        meta: {
            pagination: paginationMeta,
        },
    };
}
//# sourceMappingURL=response.util.js.map