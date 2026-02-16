import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../../common/dto/translation.dto';

export class CreateConditionDto {
  @ApiProperty({
    description:
      'Condition name in one or more languages (en, ru, uz). Slug auto-generated from first available.',
    example: { en: 'Like New', ru: 'Как новый', uz: 'Yangi kabi' },
    required: true,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name!: TranslationDto;
}
