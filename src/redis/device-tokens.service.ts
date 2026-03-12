import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

interface DeviceTokenMap {
  [deviceId: string]: string;
}

@Injectable()
export class DeviceTokensService {
  private readonly keyPrefix = 'user:deviceTokens:';

  constructor(private readonly redis: RedisService) {}

  private key(userId: string): string {
    return `${this.keyPrefix}${userId}`;
    }

  async setToken(userId: string, deviceId: string, token: string | null): Promise<void> {
    const key = this.key(userId);
    const current = (await this.redis.get<DeviceTokenMap>(key)) || {};
    if (!token) {
      if (current[deviceId]) {
        delete current[deviceId];
      }
    } else {
      current[deviceId] = token;
    }
    await this.redis.set<DeviceTokenMap>(key, current, 0);
  }

  async getTokens(userId: string): Promise<string[]> {
    const key = this.key(userId);
    const current = (await this.redis.get<DeviceTokenMap>(key)) || {};
    const tokens = Object.values(current).filter(Boolean);
    return Array.from(new Set(tokens));
  }
}
