import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageSenderDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber!: string;

  @ApiProperty({ example: 'John', required: false })
  firstName?: string | null;

  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    description:
      'True when sender is the official administration conversation account',
    example: false,
  })
  isAdministrationChat?: boolean;
}

export class MessageFileDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'https://example.com/file.jpg' })
  url!: string;

  @ApiProperty({ example: 'image.jpg' })
  filename!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 1024000 })
  size!: number;
}

export class ConversationMessageResponseDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'clx1234567890abcdef' })
  conversationId!: string;

  @ApiProperty({ type: MessageSenderDto })
  sender!: MessageSenderDto;

  @ApiProperty({ example: 'Hello, is this available?', required: false })
  replyToMessageId?: string | null;

  @ApiProperty({ example: 'TEXT' })
  messageType!: string;

  @ApiProperty({ example: 'Hello, is this available?' })
  content!: string;

  @ApiProperty({ type: MessageFileDto, required: false })
  file?: MessageFileDto | null;

  @ApiProperty({ example: 'SENT' })
  deliveryStatus!: string;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  readAt?: string | null;

  @ApiProperty({ example: false })
  isEdited!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  editedAt?: string | null;

  @ApiProperty({ example: false })
  isDeleted!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: string;

  @ApiPropertyOptional({
    description:
      'Optional payload e.g. MODERATION_REJECT with productId, reason, title, imageUrl, price, currency',
  })
  metadata?: Record<string, unknown> | null;
}
