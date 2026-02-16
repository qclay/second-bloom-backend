import { Size } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SizeResponseDto {
  @ApiProperty({ description: 'Size ID. Use as sizeId in product.' })
  id!: string;

  @ApiProperty({ example: 'Quite large' })
  name!: string;

  @ApiProperty({ example: 'quite-large' })
  slug!: string;

  @ApiProperty({ nullable: true, description: 'Creator user ID.' })
  createdById!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(size: Size): SizeResponseDto {
    return {
      id: size.id,
      name: size.name as unknown as string,
      slug: size.slug,
      createdById: size.createdById,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    };
  }
}
