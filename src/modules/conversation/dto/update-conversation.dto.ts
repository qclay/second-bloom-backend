import { IsOptional, IsBoolean, IsUUID, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConversationDto {
  @ApiPropertyOptional({
    description: 'Archive/unarchive conversation',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Block/unblock user in conversation',
    example: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;

  @ApiPropertyOptional({
    description: 'Pin product to conversation. Set to null or omit to unpin.',
    example: 'clx1234567890abcdef',
    nullable: true,
  })
  @ValidateIf((_, v) => v != null)
  @IsUUID()
  @IsOptional()
  productId?: string | null;

  @ApiPropertyOptional({
    description:
      'Pin order to conversation to show progress. Set to null or omit to unpin.',
    example: 'clx1234567890abcdef',
    nullable: true,
  })
  @ValidateIf((_, v) => v != null)
  @IsUUID()
  @IsOptional()
  orderId?: string | null;
}
