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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const promClient = __importStar(require("prom-client"));
let MetricsService = class MetricsService {
    register;
    httpRequestDuration;
    httpRequestTotal;
    httpRequestErrors;
    databaseQueryDuration;
    databaseQueryTotal;
    cacheHitTotal;
    cacheMissTotal;
    activeConnections;
    memoryUsage;
    constructor() {
        this.register = new promClient.Registry();
        promClient.collectDefaultMetrics({ register: this.register });
        this.httpRequestDuration = new promClient.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.5, 1, 2, 5, 10],
            registers: [this.register],
        });
        this.httpRequestTotal = new promClient.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.register],
        });
        this.httpRequestErrors = new promClient.Counter({
            name: 'http_request_errors_total',
            help: 'Total number of HTTP request errors',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.register],
        });
        this.databaseQueryDuration = new promClient.Histogram({
            name: 'database_query_duration_seconds',
            help: 'Duration of database queries in seconds',
            labelNames: ['operation', 'table'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
            registers: [this.register],
        });
        this.databaseQueryTotal = new promClient.Counter({
            name: 'database_queries_total',
            help: 'Total number of database queries',
            labelNames: ['operation', 'table'],
            registers: [this.register],
        });
        this.cacheHitTotal = new promClient.Counter({
            name: 'cache_hits_total',
            help: 'Total number of cache hits',
            labelNames: ['key'],
            registers: [this.register],
        });
        this.cacheMissTotal = new promClient.Counter({
            name: 'cache_misses_total',
            help: 'Total number of cache misses',
            labelNames: ['key'],
            registers: [this.register],
        });
        this.activeConnections = new promClient.Gauge({
            name: 'active_connections',
            help: 'Number of active connections',
            registers: [this.register],
        });
        this.memoryUsage = new promClient.Gauge({
            name: 'memory_usage_bytes',
            help: 'Memory usage in bytes',
            labelNames: ['type'],
            registers: [this.register],
        });
    }
    onModuleInit() {
        this.startMemoryMetrics();
    }
    async getMetrics() {
        return this.register.metrics();
    }
    recordHttpRequest(method, route, statusCode, duration) {
        const labels = {
            method,
            route,
            status_code: statusCode.toString(),
        };
        this.httpRequestDuration.observe(labels, duration / 1000);
        this.httpRequestTotal.inc(labels);
        if (statusCode >= 400) {
            this.httpRequestErrors.inc(labels);
        }
    }
    recordDatabaseQuery(operation, table, duration) {
        const labels = { operation, table };
        this.databaseQueryDuration.observe(labels, duration / 1000);
        this.databaseQueryTotal.inc(labels);
    }
    recordCacheHit(key) {
        this.cacheHitTotal.inc({ key });
    }
    recordCacheMiss(key) {
        this.cacheMissTotal.inc({ key });
    }
    setActiveConnections(count) {
        this.activeConnections.set(count);
    }
    startMemoryMetrics() {
        setInterval(() => {
            const usage = process.memoryUsage();
            this.memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
            this.memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
            this.memoryUsage.set({ type: 'external' }, usage.external);
            this.memoryUsage.set({ type: 'rss' }, usage.rss);
        }, 5000);
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map