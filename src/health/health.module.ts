import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '../config/config.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ChatModule } from '../modules/chat/chat.module';
import { AuctionModule } from '../modules/auction/auction.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ConfigModule,
    InfrastructureModule,
    ChatModule,
    AuctionModule,
    CommonModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
