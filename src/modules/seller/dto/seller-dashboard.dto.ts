import { ApiProperty } from '@nestjs/swagger';
import { SellerStatisticsDto } from './seller-statistics.dto';
import { SellerIncomeDto } from './seller-income.dto';
import { SellerActivityDto } from './seller-activity.dto';

export class SellerDashboardDto {
  @ApiProperty({ type: SellerStatisticsDto, description: 'Seller statistics' })
  statistics!: SellerStatisticsDto;

  @ApiProperty({
    type: SellerIncomeDto,
    description: 'Seller income information',
  })
  income!: SellerIncomeDto;

  @ApiProperty({
    type: SellerActivityDto,
    description: 'Recent orders and auctions',
  })
  recentActivities!: SellerActivityDto;
}
