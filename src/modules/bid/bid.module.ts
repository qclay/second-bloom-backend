import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { BidRepository } from './repositories/bid.repository';
import { AuctionModule } from '../auction/auction.module';

@Module({
  imports: [AuctionModule],
  controllers: [BidController],
  providers: [BidService, BidRepository],
  exports: [BidService, BidRepository],
})
export class BidModule {}
