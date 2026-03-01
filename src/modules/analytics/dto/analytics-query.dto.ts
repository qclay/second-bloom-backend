import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Start of date range (ISO date YYYY-MM-DD)',
    example: '2026-02-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'End of date range (ISO date YYYY-MM-DD)',
    example: '2026-02-28',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
