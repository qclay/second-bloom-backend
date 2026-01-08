import { OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';
export declare class MetricsService implements OnModuleInit {
    private readonly register;
    readonly httpRequestDuration: promClient.Histogram<string>;
    readonly httpRequestTotal: promClient.Counter<string>;
    readonly httpRequestErrors: promClient.Counter<string>;
    readonly databaseQueryDuration: promClient.Histogram<string>;
    readonly databaseQueryTotal: promClient.Counter<string>;
    readonly cacheHitTotal: promClient.Counter<string>;
    readonly cacheMissTotal: promClient.Counter<string>;
    readonly activeConnections: promClient.Gauge<string>;
    readonly memoryUsage: promClient.Gauge<string>;
    constructor();
    onModuleInit(): void;
    getMetrics(): Promise<string>;
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void;
    recordDatabaseQuery(operation: string, table: string, duration: number): void;
    recordCacheHit(key: string): void;
    recordCacheMiss(key: string): void;
    setActiveConnections(count: number): void;
    private startMemoryMetrics;
}
