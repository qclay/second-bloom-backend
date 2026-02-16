import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../../common/dto/translation.dto';

export class CreateSizeDto {
  @ApiProperty({
    description:
      'Size name in one or more languages (en, ru, uz). Slug auto-generated.',
    example: { en: 'Quite large', ru: 'Довольно большой', uz: 'Juda katta' },
    required: true,
  })
  @ValidateNested()
  @Type(() => TranslationDto)
  name!: TranslationDto;
}
