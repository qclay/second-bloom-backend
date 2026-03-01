import { Size } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { toISOString } from '../../../common/utils/date.util';

export class SizeResponseDto {
  @ApiProperty({ description: 'Size ID. Use as sizeId in product.' })
  id!: string;

  @ApiProperty({ example: 'Quite large' })
  name!: string;

  @ApiProperty({ example: 'quite-large' })
  slug!: string;

  @ApiProperty({ nullable: true, description: 'Creator user ID.' })
  createdById!: string | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  updatedAt!: string;

  static fromEntity(size: Size): SizeResponseDto {
    return {
      id: size.id,
      name: size.name as unknown as string,
      slug: size.slug,
      createdById: size.createdById,
      createdAt: toISOString(size.createdAt) ?? '',
      updatedAt: toISOString(size.updatedAt) ?? '',
    };
  }
}
