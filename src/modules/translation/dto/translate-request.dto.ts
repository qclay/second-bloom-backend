import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsIn,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  SUPPORTED_LOCALES,
  type Locale,
} from '../../../common/i18n/translation.util';

export class TranslateRequestDto {
  @ApiProperty({
    description: 'Text to translate',
    example: 'Fresh Red Roses Bouquet',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text!: string;

  @ApiProperty({
    description: 'Source language code',
    enum: SUPPORTED_LOCALES,
    example: 'en',
  })
  @IsString()
  @IsIn(SUPPORTED_LOCALES)
  sourceLocale!: Locale;

  @ApiProperty({
    description: 'Target language codes to translate into',
    enum: SUPPORTED_LOCALES,
    example: ['ru', 'uz'],
    minItems: 1,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsIn(SUPPORTED_LOCALES, { each: true })
  targetLocales!: Locale[];
}
