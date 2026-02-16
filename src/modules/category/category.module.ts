import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './repositories/category.repository';
import { RedisModule } from '../../redis/redis.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [PrismaModule, RedisModule, TranslationModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
