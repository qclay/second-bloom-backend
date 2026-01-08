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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    slowQueryThreshold;
    slowQueryCount = 0;
    totalQueryCount = 0;
    totalQueryTime = 0;
    pool = null;
    constructor() {
        const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '1000', 10) || 1000;
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is required. Please set it in your .env file.');
        }
        const pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({
            adapter,
            log: process.env.NODE_ENV === 'development'
                ? [
                    { emit: 'event', level: 'query' },
                    { emit: 'event', level: 'info' },
                    { emit: 'event', level: 'warn' },
                    { emit: 'event', level: 'error' },
                ]
                : [
                    { emit: 'event', level: 'warn' },
                    { emit: 'event', level: 'error' },
                ],
            errorFormat: 'pretty',
        });
        this.pool = pool;
        this.slowQueryThreshold = slowQueryThreshold;
        this.setupQueryMonitoring();
    }
    setupQueryMonitoring() {
        this.$on('query', (e) => {
            this.totalQueryCount++;
            this.totalQueryTime += e.duration;
            if (e.duration > this.slowQueryThreshold) {
                this.slowQueryCount++;
                this.logger.warn('Slow query detected', {
                    query: e.query,
                    duration: `${e.duration}ms`,
                    params: e.params,
                    target: e.target,
                });
            }
            if (process.env.NODE_ENV === 'development') {
                this.logger.debug('Database query', {
                    query: e.query.substring(0, 200),
                    duration: `${e.duration}ms`,
                });
            }
        });
    }
    getQueryStats() {
        return {
            totalQueries: this.totalQueryCount,
            slowQueries: this.slowQueryCount,
            averageQueryTime: this.totalQueryCount > 0
                ? Math.round(this.totalQueryTime / this.totalQueryCount)
                : 0,
            slowQueryPercentage: this.totalQueryCount > 0
                ? Math.round((this.slowQueryCount / this.totalQueryCount) * 100)
                : 0,
        };
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        }
        catch (error) {
            this.logger.error('❌ Database connection failed', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
            if (this.pool) {
                await this.pool.end();
            }
            this.logger.log('Database connection closed');
        }
        catch (error) {
            this.logger.error('Error disconnecting from database', error);
        }
    }
    async healthCheck() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map