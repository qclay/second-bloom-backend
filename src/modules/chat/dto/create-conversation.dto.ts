import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Product ID to start conversation about',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({
    description: 'Order ID to start conversation about',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: 'Initial message content',
    example: 'Hello, I am interested in this product',
    required: false,
  })
  @IsString()
  @IsOptional()
  initialMessage?: string;
}
