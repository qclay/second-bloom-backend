import { ApiProperty } from '@nestjs/swagger';

export class PeriodStatsDto {
  @ApiProperty({
    example: '2026-02-28',
    description: 'Date (today) or start of period',
  })
  date!: string;

  @ApiProperty({
    example: '28 February',
    description: 'Human-readable date label',
  })
  label!: string;

  @ApiProperty({
    example: 62,
    description: 'Users currently online (from conversation presence)',
  })
  usersOnline!: number;

  @ApiProperty({
    example: 8,
    description: 'Bouquets (products) added in this period',
  })
  bouquetsAdded!: number;

  @ApiProperty({
    example: 13,
    description: 'Bids placed by users in this period',
  })
  bidsCount!: number;
}

export class WeekPeriodStatsDto {
  @ApiProperty({ example: '2026-02-22' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-02-28' })
  dateTo!: string;

  @ApiProperty({ example: '22 - 28 February' })
  label!: string;

  @ApiProperty({
    example: 650,
    description: 'Same as current online (no historical tracking)',
  })
  usersOnline!: number;

  @ApiProperty({ example: 96 })
  bouquetsAdded!: number;

  @ApiProperty({ example: 139 })
  bidsCount!: number;
}

export class TotalsDto {
  @ApiProperty({ example: 26112 })
  totalUsers!: number;

  @ApiProperty({ example: 2410 })
  totalBouquets!: number;
}

export class CustomPeriodStatsDto {
  @ApiProperty({ example: '2026-02-01' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-02-28' })
  dateTo!: string;

  @ApiProperty({ example: '1 - 28 February' })
  label!: string;

  @ApiProperty({ example: 42 })
  bouquetsAdded!: number;

  @ApiProperty({ example: 89 })
  bidsCount!: number;
}

export class AnalyticsDashboardDto {
  @ApiProperty({ type: PeriodStatsDto })
  today!: PeriodStatsDto;

  @ApiProperty({ type: WeekPeriodStatsDto })
  week!: WeekPeriodStatsDto;

  @ApiProperty({ type: TotalsDto })
  totals!: TotalsDto;

  @ApiProperty({ type: CustomPeriodStatsDto, required: false })
  customPeriod?: CustomPeriodStatsDto;
}
