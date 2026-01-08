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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    redis;
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    defaultTtl;
    constructor(redis, configService) {
        this.redis = redis;
        this.configService = configService;
        this.defaultTtl = this.configService.get('redis.ttl', 3600);
    }
    async get(key) {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl = this.defaultTtl) {
        try {
            const serialized = JSON.stringify(value);
            if (ttl > 0) {
                await this.redis.setex(key, ttl, serialized);
            }
            else {
                await this.redis.set(key, serialized);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
            return false;
        }
    }
    async del(key) {
        try {
            await this.redis.del(key);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting key ${key}:`, error);
            return false;
        }
    }
    async delPattern(pattern) {
        try {
            const stream = this.redis.scanStream({
                match: pattern,
                count: 100,
            });
            const keys = [];
            stream.on('data', (resultKeys) => {
                keys.push(...resultKeys);
            });
            await new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });
            if (keys.length === 0)
                return 0;
            const pipeline = this.redis.pipeline();
            for (const key of keys) {
                pipeline.del(key);
            }
            const results = await pipeline.exec();
            return results?.filter((result) => result[1] === 1).length || 0;
        }
        catch (error) {
            this.logger.error(`Error deleting pattern ${pattern}:`, error);
            return 0;
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Error checking key ${key}:`, error);
            return false;
        }
    }
    async ttl(key) {
        try {
            return await this.redis.ttl(key);
        }
        catch (error) {
            this.logger.error(`Error getting TTL for key ${key}:`, error);
            return -1;
        }
    }
    async expire(key, ttl) {
        try {
            const result = await this.redis.expire(key, ttl);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Error setting expiry for key ${key}:`, error);
            return false;
        }
    }
    async increment(key) {
        try {
            return await this.redis.incr(key);
        }
        catch (error) {
            this.logger.error(`Error incrementing key ${key}:`, error);
            return 0;
        }
    }
    async decrement(key) {
        try {
            return await this.redis.decr(key);
        }
        catch (error) {
            this.logger.error(`Error decrementing key ${key}:`, error);
            return 0;
        }
    }
    async healthCheck() {
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    getClient() {
        return this.redis;
    }
    async onModuleDestroy() {
        await this.redis.quit();
        this.logger.log('Redis connection closed');
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map