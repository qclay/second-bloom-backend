import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.redisService.get<T>(key);
    } catch (error) {
      this.logger.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<boolean> {
    try {
      return await this.redisService.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      return await this.redisService.del(key);
    } catch (error) {
      this.logger.warn(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      return await this.redisService.delPattern(pattern);
    } catch (error) {
      this.logger.warn(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  generateKey(
    prefix: string,
    ...parts: (string | number | undefined)[]
  ): string {
    const validParts = parts
      .flat()
      .filter((part) => part !== undefined && part !== null)
      .map((part) => String(part));
    return validParts.length > 0 ? `${prefix}:${validParts.join(':')}` : prefix;
  }

  generateListKey(prefix: string, query: Record<string, unknown>): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce(
        (acc, key) => {
          const value = query[key];
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, unknown>,
      );

    const queryString = JSON.stringify(sortedQuery);
    return `${prefix}:list:${Buffer.from(queryString).toString('base64')}`;
  }

  async invalidateEntity(prefix: string, id?: string): Promise<void> {
    try {
      if (id) {
        await this.deletePattern(`${prefix}:${id}:*`);
      }
      await this.deletePattern(`${prefix}:list:*`);
      this.logger.debug(`Invalidated cache for ${prefix}${id ? `:${id}` : ''}`);
    } catch (error) {
      this.logger.warn(`Cache invalidation error for ${prefix}:`, error);
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss: ${key}`);
    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }
}
