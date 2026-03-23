import { ApiProperty } from '@nestjs/swagger';

export class ProductCountsResponseDto {
  @ApiProperty({
    description: 'Total number of products for the current user (all tabs).',
    example: 12,
  })
  all!: number;

  @ApiProperty({
    description:
      'Number of products that currently have an active auction (On auction tab).',
    example: 3,
  })
  inAuction!: number;

  @ApiProperty({
    description:
      'Number of products that are considered sold (order in DELIVERY status or auction ended).',
    example: 5,
  })
  sold!: number;

  @ApiProperty({
    description:
      'Number of products with orders awaiting delivery (processing / shipped).',
    example: 2,
  })
  inDelivery!: number;
}
