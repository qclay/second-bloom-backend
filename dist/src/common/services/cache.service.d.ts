import { RedisService } from '../../redis/redis.service';
export declare class CacheService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    deletePattern(pattern: string): Promise<number>;
    generateKey(prefix: string, ...parts: (string | number | undefined)[]): string;
    generateListKey(prefix: string, query: Record<string, unknown>): string;
    invalidateEntity(prefix: string, id?: string): Promise<void>;
    getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
}
