import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { SellerStatisticsDto } from './dto/seller-statistics.dto';
import { SellerIncomeDto } from './dto/seller-income.dto';
import { SellerActivityDto } from './dto/seller-activity.dto';
import { SellerDashboardDto } from './dto/seller-dashboard.dto';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['all', 'orders', 'auctions'])
  type?: 'all' | 'orders' | 'auctions' = 'all';
}

@ApiTags('Sellers')
@Controller('sellers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('me/statistics')
  @ApiOperation({
    summary: 'Get seller statistics',
    description:
      'Returns statistics for the authenticated seller including total products, active products, views, orders, and auctions.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Seller statistics retrieved successfully',
    type: SellerStatisticsDto,
  })
  async getStatistics(
    @CurrentUser('id') userId: string,
  ): Promise<SellerStatisticsDto> {
    return this.sellerService.getStatistics(userId);
  }

  @Get('me/income')
  @ApiOperation({
    summary: 'Get seller income information',
    description:
      'Returns income statistics for the authenticated seller including total income, pending income, completed income, and monthly breakdown.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Seller income information retrieved successfully',
    type: SellerIncomeDto,
  })
  async getIncome(@CurrentUser('id') userId: string): Promise<SellerIncomeDto> {
    return this.sellerService.getIncome(userId);
  }

  @Get('me/activities')
  @ApiOperation({
    summary: 'Get seller activities (orders and auctions)',
    description:
      'Returns a combined list of orders and auctions for the authenticated seller. Can filter by type (all, orders, auctions).',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Seller activities retrieved successfully',
    type: SellerActivityDto,
  })
  async getActivities(
    @CurrentUser('id') userId: string,
    @Query() query: ActivityQueryDto,
  ): Promise<SellerActivityDto> {
    return this.sellerService.getActivities(
      userId,
      query.page,
      query.limit,
      query.type,
    );
  }

  @Get('me/dashboard')
  @ApiOperation({
    summary: 'Get seller dashboard summary',
    description:
      'Returns a complete dashboard summary including statistics, income, and recent activities in a single call.',
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Seller dashboard retrieved successfully',
    type: SellerDashboardDto,
  })
  async getDashboard(
    @CurrentUser('id') userId: string,
  ): Promise<SellerDashboardDto> {
    return this.sellerService.getDashboard(userId);
  }
}
