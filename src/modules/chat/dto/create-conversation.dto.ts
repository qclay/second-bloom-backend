import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'User ID to start a conversation with',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsUUID()
  otherUserId!: string;

  @ApiPropertyOptional({
    description: 'Initial message content',
    example: 'Hello!',
  })
  @IsString()
  @IsOptional()
  initialMessage?: string;

  @ApiPropertyOptional({
    description:
      'Pin a product to this conversation (e.g. product being discussed). One participant must be the product seller.',
    example: 'clx1234567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({
    description:
      'Pin an order to this conversation to show progress. Must relate to the buyer/seller and optionally the pinned product.',
    example: 'clx1234567890abcdef',
  })
  @IsUUID()
  @IsOptional()
  orderId?: string;
}
