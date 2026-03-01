import { Condition } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { toISOString } from '../../../common/utils/date.util';

export class ConditionResponseDto {
  @ApiProperty({ description: 'Condition ID. Use as conditionId in product.' })
  id!: string;

  @ApiProperty({ example: 'Like New' })
  name!: string;

  @ApiProperty({ example: 'like-new' })
  slug!: string;

  @ApiProperty({
    nullable: true,
    description: 'Creator user ID. Null for system-seeded.',
  })
  createdById!: string | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  updatedAt!: string;

  static fromEntity(condition: Condition): ConditionResponseDto {
    return {
      id: condition.id,
      name: condition.name as unknown as string,
      slug: condition.slug,
      createdById: condition.createdById,
      createdAt: toISOString(condition.createdAt) ?? '',
      updatedAt: toISOString(condition.updatedAt) ?? '',
    };
  }
}
