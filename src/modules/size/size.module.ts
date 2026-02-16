import { Module } from '@nestjs/common';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [PrismaModule, TranslationModule],
  controllers: [SizeController],
  providers: [SizeService],
  exports: [SizeService],
})
export class SizeModule {}
