import { Module } from '@nestjs/common';
import { ConditionService } from './condition.service';
import { ConditionController } from './condition.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TranslationModule } from '../translation/translation.module';

@Module({
  imports: [PrismaModule, TranslationModule],
  controllers: [ConditionController],
  providers: [ConditionService],
  exports: [ConditionService],
})
export class ConditionModule {}
