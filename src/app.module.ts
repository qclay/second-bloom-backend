import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FileModule } from './modules/file/file.module';
import { CategoryModule } from './modules/category/category.module';
import { ConditionModule } from './modules/condition/condition.module';
import { SizeModule } from './modules/size/size.module';
import { ProductModule } from './modules/product/product.module';
import { AuctionModule } from './modules/auction/auction.module';
import { BidModule } from './modules/bid/bid.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TranslationModule } from './modules/translation/translation.module';
import { LocationModule } from './modules/location/location.module';
import { JobsModule } from './jobs/jobs.module';
import { MetricsModule } from './metrics/metrics.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ThrottlerPerUserGuard } from './common/guards/throttler-per-user.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule,
    RedisModule,
    InfrastructureModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const shortLimit = config.get<number>('THROTTLE_SHORT_LIMIT', 10);
        const mediumLimit = config.get<number>('THROTTLE_MEDIUM_LIMIT', 50);
        const longLimit = config.get<number>('THROTTLE_LONG_LIMIT', 100);
        const longTtl = config.get<number>('THROTTLE_LONG_TTL', 60000);
        return [
          { name: 'short', ttl: 1000, limit: shortLimit },
          { name: 'medium', ttl: 10000, limit: mediumLimit },
          { name: 'long', ttl: longTtl, limit: longLimit },
        ];
      },
    }),
    AuthModule,
    UserModule,
    FileModule,
    CategoryModule,
    ConditionModule,
    SizeModule,
    ProductModule,
    AuctionModule,
    BidModule,
    OrderModule,
    ReviewModule,
    NotificationModule,
    ConversationModule,
    PaymentModule,
    SettingsModule,
    TranslationModule,
    LocationModule,
    JobsModule,
    MetricsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerPerUserGuard,
    },
  ],
})
export class AppModule {}
