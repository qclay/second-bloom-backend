import { ApiProperty } from '@nestjs/swagger';

export class SellerIncomeDto {
  @ApiProperty({ example: 15000000, description: 'Total income in UZS' })
  totalIncome!: number;

  @ApiProperty({ example: 'UZS', description: 'Currency code' })
  currency!: string;

  @ApiProperty({
    example: 2000000,
    description: 'Pending income (not yet paid)',
  })
  pendingIncome!: number;

  @ApiProperty({ example: 13000000, description: 'Completed income (paid)' })
  completedIncome!: number;

  @ApiProperty({ example: 5000000, description: 'Income for current month' })
  thisMonth!: number;

  @ApiProperty({ example: 4500000, description: 'Income for last month' })
  lastMonth!: number;

  @ApiProperty({ example: 0, description: 'Refunded amount (deprecated)' })
  refundedAmount!: number;
}
