import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionRepository } from './repositories/auction.repository';
import { ProductModule } from '../product/product.module';
import { BidModule } from '../bid/bid.module';
import { NotificationModule } from '../notification/notification.module';
import { AuctionSchedulingService } from './auction-scheduling.service';



@Module({
  imports: [
    forwardRef(() => ProductModule),
    forwardRef(() => BidModule),
    NotificationModule,
    BullModule.registerQueue({
      name: 'auction',
    }),
  ],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionRepository, AuctionSchedulingService],
  exports: [
    AuctionService,
    AuctionRepository,
    AuctionSchedulingService,
  ],
})
export class AuctionModule { }
