import { ApiProperty } from '@nestjs/swagger';

/**
 * Pagination metadata following industry standards
 * Used by companies like Stripe, GitHub, etc.
 */
export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page number (1-indexed)' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ example: 150, description: 'Total number of items' })
  total!: number;

  @ApiProperty({ example: 8, description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({
    example: true,
    description: 'Whether there is a next page',
  })
  hasNextPage!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  hasPreviousPage!: boolean;
}
