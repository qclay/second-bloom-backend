import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionRepository } from './repositories/auction.repository';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionRepository],
  exports: [AuctionService, AuctionRepository],
})
export class AuctionModule {}
