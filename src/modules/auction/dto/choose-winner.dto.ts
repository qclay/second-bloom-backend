import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ChooseWinnerDto {
  @ApiPropertyOptional({
    description:
      'User ID to set as auction winner. Must have at least one bid on this auction. Omit or null to clear winner.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  winnerId?: string | null;
}
