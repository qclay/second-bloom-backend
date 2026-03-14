import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuctionRepository } from './repositories/auction.repository';
import { AuctionSchedulingService } from './auction-scheduling.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'auction',
    }),
  ],
  providers: [AuctionRepository, AuctionSchedulingService],
  exports: [AuctionRepository, AuctionSchedulingService],
})
export class AuctionSharedModule {}
