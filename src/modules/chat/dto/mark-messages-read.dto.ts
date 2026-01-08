import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkMessagesReadDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  conversationId!: string;

  @ApiProperty({
    description:
      'Specific message IDs to mark as read (optional, if not provided, marks all as read)',
    example: ['clx1234567890abcdef', 'clx0987654321fedcba'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  @IsOptional()
  messageIds?: string[];
}
