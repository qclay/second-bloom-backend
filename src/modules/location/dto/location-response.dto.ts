import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Name is localized (en, ru, uz). Resolved to a single string by Accept-Language. */
const nameDesc =
  'Localized name (en, ru, uz). Response resolves to one string per Accept-Language.';

export class CountryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Uzbekistan', description: nameDesc })
  name!: string;

  @ApiPropertyOptional({ example: 'UZ' })
  code?: string | null;
}

export class RegionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 'Tashkent', description: nameDesc })
  name!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  countryId!: string;
}

export class CityResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiProperty({ example: 'Tashkent', description: nameDesc })
  name!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  regionId!: string;
}

export class DistrictResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003' })
  id!: string;

  @ApiProperty({ example: 'Yunusabad', description: nameDesc })
  name!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  cityId!: string;
}
