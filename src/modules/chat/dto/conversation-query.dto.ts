import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by archived conversations',
    example: false,
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @ApiProperty({
    description: 'Filter by order ID',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: 'Filter by product ID',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsOptional()
  productId?: string;
}
