import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class PresenceService {
  private readonly keyPrefix = 'presence:';
  private readonly ttlSeconds = 90; // presence TTL

  constructor(private readonly redis: RedisService) {}

  async ping(userId: string): Promise<void> {
    const key = this.key(userId);
    await this.redis.set(key, 1, this.ttlSeconds);
  }

  async isOnline(userId: string): Promise<boolean> {
    const key = this.key(userId);
    const val = await this.redis.get<unknown>(key);
    return val !== null;
  }

  private key(userId: string): string {
    return `${this.keyPrefix}${userId}`;
  }
}
