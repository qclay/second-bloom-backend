import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Locale } from '../i18n/translation.util';

export class TranslationDto {
  @ApiPropertyOptional({ example: 'Roses', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  en?: string;

  @ApiPropertyOptional({ example: 'Розы', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ru?: string;

  @ApiPropertyOptional({ example: 'Atirgul', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  uz?: string;
}

export class TranslationDescriptionDto {
  @ApiPropertyOptional({ example: 'Fresh flowers', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  en?: string;

  @ApiPropertyOptional({ example: 'Свежие цветы', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  ru?: string;

  @ApiPropertyOptional({ example: 'Yangı güller', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  uz?: string;
}

export function atLeastOneTranslation(
  obj: Partial<Record<Locale, string>> | undefined,
): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return (
    (typeof obj.en === 'string' && obj.en.trim() !== '') ||
    (typeof obj.ru === 'string' && obj.ru.trim() !== '') ||
    (typeof obj.uz === 'string' && obj.uz.trim() !== '')
  );
}
