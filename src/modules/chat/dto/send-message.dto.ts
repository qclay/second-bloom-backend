import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
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
    description: 'Message content',
    example: 'Hello, is this product still available?',
    maxLength: 5000,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
    default: MessageType.TEXT,
    required: false,
  })
  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType = MessageType.TEXT;

  @ApiProperty({
    description: 'File ID for attachments (images, files)',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  fileId?: string;

  @ApiProperty({
    description: 'ID of message being replied to',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  replyToMessageId?: string;
}
