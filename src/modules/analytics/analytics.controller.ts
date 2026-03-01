import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { AnalyticsDashboardDto } from './dto/analytics-dashboard.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get analytics dashboard (Admin only)',
    description:
      'Returns stats for today, current week, and totals. Optional dateFrom/dateTo for custom range (bouquets added, bids in range).',
  })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Analytics dashboard',
    type: AnalyticsDashboardDto,
  })
  async getDashboard(
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsDashboardDto> {
    return this.analyticsService.getDashboard(query);
  }
}
