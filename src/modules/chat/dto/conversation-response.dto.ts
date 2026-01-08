import { ApiProperty } from '@nestjs/swagger';

export class ConversationParticipantDto {
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

export class ConversationLastMessageDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'Hello, is this available?' })
  content!: string;

  @ApiProperty({ example: 'TEXT' })
  messageType!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: false })
  isRead!: boolean;
}

export class ConversationResponseDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ type: ConversationParticipantDto })
  seller!: ConversationParticipantDto;

  @ApiProperty({ type: ConversationParticipantDto })
  buyer!: ConversationParticipantDto;

  @ApiProperty({ example: 'clx1234567890abcdef', required: false })
  orderId?: string | null;

  @ApiProperty({ example: 'clx1234567890abcdef', required: false })
  productId?: string | null;

  @ApiProperty({ example: 5 })
  unreadCount!: number;

  @ApiProperty({ example: false })
  isArchived!: boolean;

  @ApiProperty({ example: false })
  isBlocked!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  lastMessageAt?: Date | null;

  @ApiProperty({ type: ConversationLastMessageDto, required: false })
  lastMessage?: ConversationLastMessageDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: Date;
}
