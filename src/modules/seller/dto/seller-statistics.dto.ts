import { ApiProperty } from '@nestjs/swagger';

export class SellerStatisticsDto {
  @ApiProperty({ example: 250, description: 'Total number of products' })
  totalProducts!: number;

  @ApiProperty({ example: 150, description: 'Number of active products' })
  activeProducts!: number;

  @ApiProperty({ example: 100, description: 'Number of inactive products' })
  inactiveProducts!: number;

  @ApiProperty({
    example: 1500,
    description: 'Total views across all products',
  })
  totalViews!: number;

  @ApiProperty({ example: 45, description: 'Total number of orders' })
  totalOrders!: number;

  @ApiProperty({ example: 15, description: 'Number of pending orders' })
  pendingOrders!: number;

  @ApiProperty({ example: 10, description: 'Number of active auctions' })
  activeAuctions!: number;

  @ApiProperty({ example: 5, description: 'Number of completed auctions' })
  completedAuctions!: number;
}
