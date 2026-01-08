import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageQueryDto {
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
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 50;

  @ApiProperty({
    description: 'Cursor for pagination (message ID)',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  cursor?: string;
}
