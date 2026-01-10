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
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../redis/redis.service");
let CacheService = CacheService_1 = class CacheService {
    redisService;
    logger = new common_1.Logger(CacheService_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    async get(key) {
        try {
            return await this.redisService.get(key);
        }
        catch (error) {
            this.logger.warn(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl = 3600) {
        try {
            return await this.redisService.set(key, value, ttl);
        }
        catch (error) {
            this.logger.warn(`Cache set error for key ${key}:`, error);
            return false;
        }
    }
    async delete(key) {
        try {
            return await this.redisService.del(key);
        }
        catch (error) {
            this.logger.warn(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }
    async deletePattern(pattern) {
        try {
            return await this.redisService.delPattern(pattern);
        }
        catch (error) {
            this.logger.warn(`Cache delete pattern error for ${pattern}:`, error);
            return 0;
        }
    }
    generateKey(prefix, ...parts) {
        const validParts = parts
            .flat()
            .filter((part) => part !== undefined && part !== null)
            .map((part) => String(part));
        return validParts.length > 0 ? `${prefix}:${validParts.join(':')}` : prefix;
    }
    generateListKey(prefix, query) {
        const sortedQuery = Object.keys(query)
            .sort()
            .reduce((acc, key) => {
            const value = query[key];
            if (value !== undefined && value !== null) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const queryString = JSON.stringify(sortedQuery);
        return `${prefix}:list:${Buffer.from(queryString).toString('base64')}`;
    }
    async invalidateEntity(prefix, id) {
        try {
            if (id) {
                await this.deletePattern(`${prefix}:${id}:*`);
            }
            await this.deletePattern(`${prefix}:list:*`);
            this.logger.debug(`Invalidated cache for ${prefix}${id ? `:${id}` : ''}`);
        }
        catch (error) {
            this.logger.warn(`Cache invalidation error for ${prefix}:`, error);
        }
    }
    async getOrSet(key, fetcher, ttl = 3600) {
        const cached = await this.get(key);
        if (cached !== null) {
            this.logger.debug(`Cache hit: ${key}`);
            return cached;
        }
        this.logger.debug(`Cache miss: ${key}`);
        const data = await fetcher();
        await this.set(key, data, ttl);
        return data;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CacheService);
//# sourceMappingURL=cache.service.js.map