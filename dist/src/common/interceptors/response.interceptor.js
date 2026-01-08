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
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const config_1 = require("@nestjs/config");
function hasPaginationMeta(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    const dataObj = data;
    if (!('meta' in dataObj) || !('data' in dataObj)) {
        return false;
    }
    if (!Array.isArray(dataObj.data)) {
        return false;
    }
    const meta = dataObj.meta;
    if (typeof meta !== 'object' || meta === null) {
        return false;
    }
    const metaObj = meta;
    return (typeof metaObj.total === 'number' &&
        typeof metaObj.page === 'number' &&
        typeof metaObj.limit === 'number' &&
        typeof metaObj.totalPages === 'number');
}
let ResponseInterceptor = class ResponseInterceptor {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => {
            const rateLimitLimit = response.getHeader('X-RateLimit-Limit');
            const rateLimitRemaining = response.getHeader('X-RateLimit-Remaining');
            const rateLimitReset = response.getHeader('X-RateLimit-Reset');
            if (rateLimitLimit) {
                response.setHeader('X-RateLimit-Limit', rateLimitLimit);
            }
            if (rateLimitRemaining) {
                response.setHeader('X-RateLimit-Remaining', rateLimitRemaining);
            }
            if (rateLimitReset) {
                response.setHeader('X-RateLimit-Reset', rateLimitReset);
            }
            let responseData = data;
            let paginationMeta;
            if (hasPaginationMeta(data)) {
                responseData = data.data;
                const serviceMeta = data.meta;
                paginationMeta = {
                    page: serviceMeta.page,
                    limit: serviceMeta.limit,
                    total: serviceMeta.total,
                    totalPages: serviceMeta.totalPages,
                    hasNextPage: serviceMeta.page < serviceMeta.totalPages,
                    hasPreviousPage: serviceMeta.page > 1,
                };
            }
            const statusCode = response.statusCode || 200;
            return {
                success: true,
                statusCode,
                data: responseData,
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId: request.id,
                ...(paginationMeta && {
                    meta: {
                        pagination: paginationMeta,
                    },
                }),
            };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map