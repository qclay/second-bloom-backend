import { ApiProperty } from '@nestjs/swagger';
import { Locale } from '../../../common/i18n/translation.util';

export class TranslateResponseDto {
  @ApiProperty({
    description: 'Translated text per target locale. Keys: en, ru, uz.',
    example: {
      ru: 'Букет свежих красных роз',
      uz: 'Yangi qizil atirgul buketi',
    },
  })
  translations!: Partial<Record<Locale, string>>;
}
