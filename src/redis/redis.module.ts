import { Global, Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        interface RedisConfig {
          url: string;
          password?: string;
        }

        const redisConfig = configService.get<RedisConfig>('redis');

        if (!redisConfig) {
          throw new Error('Redis configuration is missing');
        }

        const client = new Redis(redisConfig.url, {
          password: redisConfig.password,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: false,
        });

        const logger = new Logger('RedisModule');

        client.on('error', (err: Error) => {
          logger.error('Redis Client Error', err);
        });

        client.on('connect', () => {
          logger.log('✅ Redis connected');
        });

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
