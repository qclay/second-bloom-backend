import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './repositories/order.repository';
import { ProductModule } from '../product/product.module';
import { AuctionSharedModule } from '../auction/auction-shared.module';
import { ConversationModule } from '../conversation/conversation.module';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    AuctionSharedModule,
    ConversationModule,
    NotificationModule,
    BullModule.registerQueue({
      name: 'order',
    }),
    BullModule.registerQueue({
      name: 'conversation',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
