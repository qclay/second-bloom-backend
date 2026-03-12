import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionRepository } from './repositories/auction.repository';
import { AuctionGateway } from './gateways/auction.gateway';
import { ProductModule } from '../product/product.module';
import { BidModule } from '../bid/bid.module';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { AuctionSchedulingService } from './auction-scheduling.service';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    forwardRef(() => BidModule),
    NotificationModule,
    BullModule.registerQueue({
      name: 'auction',
    }),
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionRepository, AuctionGateway, AuctionSchedulingService],
  exports: [
    AuctionService,
    AuctionRepository,
    AuctionGateway,
    AuctionSchedulingService,
  ],
})
export class AuctionModule { }
