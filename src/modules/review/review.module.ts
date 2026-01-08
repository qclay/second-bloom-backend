import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './repositories/review.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [PrismaModule, OrderModule, ProductModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
