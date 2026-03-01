import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModerateProductDto {
  @ApiProperty({
    enum: ['approve', 'reject'],
    description: 'Moderation action',
  })
  @IsEnum(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @ApiPropertyOptional({
    description: 'Required when action is reject. Reason shown to the seller.',
    example: 'Bad photo',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
