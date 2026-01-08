"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const aws_service_1 = require("../infrastructure/aws/aws.service");
const sms_service_1 = require("../infrastructure/sms/sms.service");
let HealthService = HealthService_1 = class HealthService {
    prisma;
    redis;
    configService;
    awsService;
    smsService;
    logger = new common_1.Logger(HealthService_1.name);
    startTime = Date.now();
    constructor(prisma, redis, configService, awsService, smsService) {
        this.prisma = prisma;
        this.redis = redis;
        this.configService = configService;
        this.awsService = awsService;
        this.smsService = smsService;
    }
    async checkHealth() {
        const [databaseCheck, redisCheck, awsCheck, smsCheck, diskInfo] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkAws(),
            this.checkSms(),
            this.checkDiskSpace(),
        ]);
        const memoryUsage = process.memoryUsage();
        const overallStatus = databaseCheck.status === 'ok' && redisCheck.status === 'ok'
            ? 'ok'
            : 'error';
        const services = {
            database: databaseCheck,
            redis: redisCheck,
        };
        if (awsCheck) {
            services.aws = awsCheck;
        }
        if (smsCheck) {
            services.sms = smsCheck;
        }
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: process.env.npm_package_version || '1.0.0',
            environment: this.configService.get('NODE_ENV', 'development'),
            services,
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
            },
            disk: diskInfo,
        };
    }
    async checkDatabase() {
        const startTime = Date.now();
        try {
            await this.prisma.healthCheck();
            const responseTime = Date.now() - startTime;
            let connectionPool;
            try {
                const poolStatsResult = await this.prisma.$queryRaw `
          SELECT 
            COUNT(*) FILTER (WHERE state = 'active') as active_connections,
            COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
            COUNT(*) as total_connections,
            (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
          FROM pg_stat_activity
          WHERE datname = current_database()
        `;
                if (poolStatsResult && poolStatsResult.length > 0) {
                    const stats = poolStatsResult[0];
                    const activeConnections = Number(stats.active_connections);
                    const idleConnections = Number(stats.idle_connections);
                    const totalConnections = Number(stats.total_connections);
                    const maxConnections = Number(stats.max_connections);
                    const utilization = maxConnections > 0
                        ? Math.round((totalConnections / maxConnections) * 100)
                        : 0;
                    if (utilization > 80) {
                        this.logger.warn(`Database connection pool utilization is high: ${utilization}%`);
                    }
                    connectionPool = {
                        activeConnections,
                        idleConnections,
                        totalConnections,
                        maxConnections,
                        utilization,
                    };
                }
            }
            catch (error) {
                this.logger.warn('Failed to fetch connection pool stats', error instanceof Error ? error.message : 'Unknown error');
            }
            return {
                status: 'ok',
                responseTime,
                message: 'Database connection healthy',
                connectionPool,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Database connection failed',
            };
        }
    }
    async checkRedis() {
        const startTime = Date.now();
        try {
            const isHealthy = await this.redis.healthCheck();
            const responseTime = Date.now() - startTime;
            return {
                status: isHealthy ? 'ok' : 'error',
                responseTime,
                message: isHealthy
                    ? 'Redis connection healthy'
                    : 'Redis connection failed',
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Redis connection failed',
            };
        }
    }
    checkAws() {
        if (!this.awsService) {
            return Promise.resolve(undefined);
        }
        try {
            const bucketName = this.configService.get('aws.bucket');
            if (!bucketName) {
                return Promise.resolve({
                    status: 'error',
                    message: 'AWS S3 bucket not configured',
                });
            }
            return Promise.resolve({
                status: 'ok',
                message: 'AWS S3 configured',
            });
        }
        catch (error) {
            return Promise.resolve({
                status: 'error',
                message: error instanceof Error ? error.message : 'AWS check failed',
            });
        }
    }
    checkSms() {
        if (!this.smsService) {
            return Promise.resolve(undefined);
        }
        try {
            const smsApiKey = this.configService.get('sms.apiKey');
            const smsApiUrl = this.configService.get('sms.url');
            if (!smsApiKey || !smsApiUrl) {
                return Promise.resolve({
                    status: 'error',
                    message: 'SMS service not configured',
                });
            }
            return Promise.resolve({
                status: 'ok',
                message: 'SMS service configured',
            });
        }
        catch (error) {
            return Promise.resolve({
                status: 'error',
                message: error instanceof Error ? error.message : 'SMS check failed',
            });
        }
    }
    async checkDiskSpace() {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const stats = await fs.statfs('/');
            const free = Math.round((stats.bavail * stats.bsize) / 1024 / 1024);
            const total = Math.round((stats.blocks * stats.bsize) / 1024 / 1024);
            const used = total - free;
            const percentage = Math.round((used / total) * 100);
            return {
                free,
                total,
                percentage,
            };
        }
        catch (error) {
            this.logger.warn('Failed to check disk space', error);
            return undefined;
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        config_1.ConfigService,
        aws_service_1.AwsService,
        sms_service_1.SmsService])
], HealthService);
//# sourceMappingURL=health.service.js.map