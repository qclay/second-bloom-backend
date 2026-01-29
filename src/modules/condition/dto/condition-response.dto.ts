import { Condition } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(condition: Condition): ConditionResponseDto {
    return {
      id: condition.id,
      name: condition.name,
      slug: condition.slug,
      createdById: condition.createdById,
      createdAt: condition.createdAt,
      updatedAt: condition.updatedAt,
    };
  }
}
