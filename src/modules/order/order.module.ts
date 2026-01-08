import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './repositories/order.repository';
import { ProductModule } from '../product/product.module';
import { AuctionModule } from '../auction/auction.module';

@Module({
  imports: [ProductModule, AuctionModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
