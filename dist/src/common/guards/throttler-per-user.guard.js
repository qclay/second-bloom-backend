"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerPerUserGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let ThrottlerPerUserGuard = class ThrottlerPerUserGuard extends throttler_1.ThrottlerGuard {
    getTracker(req) {
        const request = req;
        const userId = request.user?.id;
        const ip = request.ip || request.socket?.remoteAddress || 'anonymous';
        return Promise.resolve(userId || ip);
    }
    getLimit(context, throttler) {
        const request = context
            .switchToHttp()
            .getRequest();
        const user = request.user;
        const baseLimit = typeof throttler.limit === 'number' ? throttler.limit : 100;
        if (user?.role === 'ADMIN') {
            return baseLimit * 10;
        }
        if (user?.id) {
            return baseLimit * 2;
        }
        return baseLimit;
    }
    throwThrottlingException(context, throttlerLimitDetail) {
        const response = context.switchToHttp().getResponse();
        const limit = throttlerLimitDetail.limit;
        const remaining = Math.max(0, limit - throttlerLimitDetail.totalHits);
        const reset = Math.ceil((Date.now() + throttlerLimitDetail.timeToExpire) / 1000);
        const retryAfter = Math.ceil(throttlerLimitDetail.timeToExpire / 1000);
        response.setHeader('X-RateLimit-Limit', limit.toString());
        response.setHeader('X-RateLimit-Remaining', remaining.toString());
        response.setHeader('X-RateLimit-Reset', reset.toString());
        response.setHeader('Retry-After', retryAfter.toString());
        throw new common_1.HttpException({
            success: false,
            message: `Too many requests. Limit: ${limit} requests per ${throttlerLimitDetail.ttl}ms. Please try again in ${retryAfter}s.`,
            statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
            limit,
            remaining,
            reset,
            retryAfter,
        }, common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
    addThrottlerHeaders(response, throttlerLimitDetail) {
        const limit = throttlerLimitDetail.limit;
        const remaining = Math.max(0, limit - throttlerLimitDetail.totalHits);
        const reset = Math.ceil((Date.now() + throttlerLimitDetail.timeToExpire) / 1000);
        response.setHeader('X-RateLimit-Limit', limit.toString());
        response.setHeader('X-RateLimit-Remaining', remaining.toString());
        response.setHeader('X-RateLimit-Reset', reset.toString());
    }
};
exports.ThrottlerPerUserGuard = ThrottlerPerUserGuard;
exports.ThrottlerPerUserGuard = ThrottlerPerUserGuard = __decorate([
    (0, common_1.Injectable)()
], ThrottlerPerUserGuard);
//# sourceMappingURL=throttler-per-user.guard.js.map