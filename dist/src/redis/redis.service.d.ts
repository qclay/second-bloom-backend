import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly redis;
    private readonly configService;
    private readonly logger;
    private readonly defaultTtl;
    constructor(redis: Redis, configService: ConfigService);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    delPattern(pattern: string): Promise<number>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
    expire(key: string, ttl: number): Promise<boolean>;
    increment(key: string): Promise<number>;
    decrement(key: string): Promise<number>;
    healthCheck(): Promise<boolean>;
    getClient(): Redis;
    onModuleDestroy(): Promise<void>;
}
