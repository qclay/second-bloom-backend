import { Module, forwardRef } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { BidRepository } from './repositories/bid.repository';
import { AuctionModule } from '../auction/auction.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [forwardRef(() => AuctionModule), NotificationModule],
  controllers: [BidController],
  providers: [BidService, BidRepository],
  exports: [BidService, BidRepository],
})
export class BidModule {}
