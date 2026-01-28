import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { BidRepository } from './repositories/bid.repository';
import { AuctionModule } from '../auction/auction.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuctionModule, NotificationModule],
  controllers: [BidController],
  providers: [BidService, BidRepository],
  exports: [BidService, BidRepository],
})
export class BidModule {}
