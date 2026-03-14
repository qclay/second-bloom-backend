import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { BidRepository } from './repositories/bid.repository';
import { AuctionSharedModule } from '../auction/auction-shared.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuctionSharedModule, NotificationModule],
  controllers: [BidController],
  providers: [BidService, BidRepository],
  exports: [BidService, BidRepository],
})
export class BidModule {}
