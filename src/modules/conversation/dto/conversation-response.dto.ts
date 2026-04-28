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

  @ApiPropertyOptional({
    enum: ['seller', 'consumer'],
    description:
      'Role in this order-linked conversation: seller (flower author) or consumer (buyer)',
  })
  role?: 'seller' | 'consumer' | null;
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

  @ApiProperty({ example: true })
  isCharity!: boolean;

  @ApiPropertyOptional({ example: 'UZS' })
  currency?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/rose.jpg' })
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'clxauction1234567890',
    description: 'Auction ID if this product is/was part of an auction',
  })
  auctionId?: string | null;
}

export class PinnedOrderProgressDto {
  @ApiProperty({
    example: 'PROCESSING',
    enum: ['PROCESSING', 'DELIVERED', 'SHIPPED', 'CANCELLED'],
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

  @ApiPropertyOptional({
    example: 'clxauction1234567890',
    description: 'Auction ID if this order was created from auction winner',
  })
  auctionId?: string | null;

  @ApiProperty({ example: 'ORD-ABC123' })
  orderNumber!: string;

  @ApiProperty({ example: 150000 })
  amount!: number;

  @ApiProperty({
    example: 'PROCESSING',
    enum: ['PROCESSING', 'DELIVERED', 'SHIPPED', 'CANCELLED'],
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
  createdAt!: string;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiPropertyOptional({
    description:
      'Optional payload, e.g. for SYSTEM messages like ORDER_CREATED',
  })
  metadata?: Record<string, unknown> | null;
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

  @ApiPropertyOptional({
    description:
      'URL of the first (main) image of the pinned product in the conversation',
    example: 'https://cdn.example.com/flower.jpg',
  })
  flowerImageUrl?: string | null;

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
  blocked!: boolean;

  @ApiProperty({
    example: false,
    description:
      'Conversation-level block flag for the current participant. Prevents sending messages in this chat.',
  })
  isBlocked!: boolean;

  @ApiProperty({
    example: true,
    description:
      'False when order reaches DELIVERY status or message was sent after delivery timestamp (conversation closed for new activity)',
  })
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  lastMessageAt?: string | null;

  @ApiProperty({ type: ConversationLastMessageDto, required: false })
  lastMessage?: ConversationLastMessageDto | null;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: string;

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
