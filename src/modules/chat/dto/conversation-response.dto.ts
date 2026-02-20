import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConversationParticipantDto {
  @ApiProperty({ example: 'clx1234567890abcdef', description: 'User ID' })
  userId!: string;

  @ApiPropertyOptional({ example: 'johndoe', description: 'Username' })
  username?: string | null;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string | null;
}

export class ConversationSellerBuyerDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string | null;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string | null;
}

export class PinnedProductDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'fresh-roses-bouquet' })
  slug!: string;

  @ApiProperty({
    description: 'Resolved title per Accept-Language',
    example: 'Fresh Roses Bouquet',
  })
  title!: string;

  @ApiProperty({ example: 150000 })
  price!: number;

  @ApiPropertyOptional({ example: 'UZS' })
  currency?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/rose.jpg' })
  imageUrl?: string | null;
}

export class PinnedOrderProgressDto {
  @ApiProperty({
    example: 'PENDING',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ],
  })
  status!: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  shippedAt?: Date | null;

  @ApiPropertyOptional({ example: '2024-01-20T14:00:00Z' })
  deliveredAt?: Date | null;
}

export class PinnedOrderDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'ORD-ABC123' })
  orderNumber!: string;

  @ApiProperty({ example: 150000 })
  amount!: number;

  @ApiProperty({
    example: 'PENDING',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ],
  })
  status!: string;

  @ApiPropertyOptional({ type: PinnedOrderProgressDto })
  progress?: PinnedOrderProgressDto;
}

export class ConversationLastMessageDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiProperty({ example: 'Hello!' })
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

  @ApiPropertyOptional({
    description:
      'Pinned product (bouquet) ID – which flower this conversation is about',
    example: 'clx1234567890abcdef',
  })
  flowerId?: string | null;

  @ApiProperty({
    type: [ConversationParticipantDto],
    description: 'All participants in the conversation',
  })
  participants!: ConversationParticipantDto[];

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

  @ApiPropertyOptional({
    description:
      'Seller (product owner) when conversation has a pinned product',
    type: ConversationSellerBuyerDto,
  })
  seller?: ConversationSellerBuyerDto | null;

  @ApiPropertyOptional({
    description:
      'Buyer when conversation has a pinned order or the other participant',
    type: ConversationSellerBuyerDto,
  })
  buyer?: ConversationSellerBuyerDto | null;

  @ApiPropertyOptional({
    description: 'Pinned product for this conversation',
    type: PinnedProductDto,
  })
  pinnedProduct?: PinnedProductDto | null;

  @ApiPropertyOptional({
    description: 'Pinned order with progress (status, shippedAt, deliveredAt)',
    type: PinnedOrderDto,
  })
  pinnedOrder?: PinnedOrderDto | null;
}
