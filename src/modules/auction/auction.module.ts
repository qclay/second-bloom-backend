import { Module, forwardRef } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionSharedModule } from './auction-shared.module';
import { ProductModule } from '../product/product.module';
import { BidModule } from '../bid/bid.module';
import { NotificationModule } from '../notification/notification.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [
    AuctionSharedModule,
    forwardRef(() => ProductModule),
    forwardRef(() => BidModule),
    NotificationModule,
    ConversationModule,
  ],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService, AuctionSharedModule],
})
export class AuctionModule {}
