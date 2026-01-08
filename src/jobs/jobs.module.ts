import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionModule } from '../modules/auction/auction.module';
import { AuthModule } from '../modules/auth/auth.module';
import { EndExpiredAuctionsProcessor } from './auction/end-expired-auctions.processor';
import { EndExpiredAuctionsScheduler } from './auction/end-expired-auctions.scheduler';
import { CleanExpiredOtpsProcessor } from './auth/clean-expired-otps.processor';
import { CleanExpiredOtpsScheduler } from './auth/clean-expired-otps.scheduler';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<{
          url: string;
          password?: string;
        }>('redis');

        if (!redisConfig) {
          throw new Error('Redis configuration is missing');
        }

        const redisUrl = new URL(redisConfig.url);
        return {
          redis: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port || '6379', 10),
            password: redisUrl.password || redisConfig.password,
          },
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'auction',
    }),
    BullModule.registerQueue({
      name: 'auth',
    }),
    AuctionModule,
    AuthModule,
  ],
  providers: [
    EndExpiredAuctionsProcessor,
    EndExpiredAuctionsScheduler,
    CleanExpiredOtpsProcessor,
    CleanExpiredOtpsScheduler,
  ],
  exports: [BullModule],
})
export class JobsModule {}
