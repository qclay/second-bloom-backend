import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './repositories/product.repository';
import { CategoryModule } from '../category/category.module';
import { AuctionModule } from '../auction/auction.module';
import { TranslationModule } from '../translation/translation.module';
import { ConversationModule } from '../conversation/conversation.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    CategoryModule,
    forwardRef(() => AuctionModule),
    TranslationModule,
    ConversationModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
