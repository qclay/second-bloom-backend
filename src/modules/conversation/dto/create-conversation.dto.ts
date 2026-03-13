import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'User ID to start chat with',
    example: 'clx1234567890abcdef',
  })
  @IsUUID()
  otherUserId!: string;

  @ApiProperty({
    description: 'Optional Product ID related to this chat',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({
    description: 'Optional initial message to send',
    example: 'Hello!',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  initialMessage?: string;
}
