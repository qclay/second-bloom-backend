import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkMessagesReadBodyDto {
  @ApiPropertyOptional({
    description:
      'Specific message IDs to mark as read. If omitted, all unread messages in the conversation are marked as read.',
    example: ['clx1234567890abcdef', 'clx0987654321fedcba'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  @IsOptional()
  messageIds?: string[];
}

export class MarkMessagesReadDto extends MarkMessagesReadBodyDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  conversationId!: string;
}
