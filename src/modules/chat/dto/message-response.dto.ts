import { ApiProperty } from '@nestjs/swagger';

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

export class MessageResponseDto {
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
  readAt?: Date | null;

  @ApiProperty({ example: false })
  isEdited!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  editedAt?: Date | null;

  @ApiProperty({ example: false })
  isDeleted!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: Date;
}
