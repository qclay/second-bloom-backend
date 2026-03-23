import { Order, OrderStatus, PaymentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ProductNestedDto } from '../../product/dto/product-nested.dto';
import { toISOString } from '../../../common/utils/date.util';

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  buyerId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty({ nullable: true })
  auctionId!: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty({
    enum: OrderStatus,
    description: 'Order status',
    example: 'PROCESSING',
  })
  status!: string;

  @ApiProperty({
    enum: PaymentStatus,
    description: 'Payment status',
    example: 'PENDING',
  })
  paymentStatus!: string;

  @ApiProperty({ nullable: true })
  shippingAddress!: string | null;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  cancelledAt!: string | null;

  @ApiProperty({ nullable: true })
  cancelledBy!: string | null;

  @ApiProperty({ nullable: true })
  cancellationReason!: string | null;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  shippedAt!: string | null;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  deliveredAt!: string | null;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  deletedAt!: string | null;

  @ApiProperty({ nullable: true })
  deletedBy!: string | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  completedAt!: string | null;

  @ApiProperty({ required: false })
  buyer?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };

  @ApiProperty({ type: () => ProductNestedDto, required: false })
  product?: ProductNestedDto & { sellerId: string };

  @ApiProperty({ nullable: true, required: false })
  auction?: {
    id: string;
    productId: string;
    status: string;
  } | null;

  @ApiProperty({ required: false })
  seller?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };

  @ApiProperty({
    nullable: true,
    required: false,
    description: 'First conversation ID for this order (open chat)',
  })
  conversationId?: string | null;

  static fromEntity(
    order: Order & {
      buyer?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
      product?: {
        id: string;
        title: unknown;
        slug: string;
        price: unknown;
        sellerId: string;
        images?: Array<{ fileId: string; file?: { url: string } }>;
      };
      auction?: {
        id: string;
        productId: string;
        status: string;
      } | null;
      seller?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
      conversations?: Array<{ id: string }>;
    },
  ): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      buyerId: order.buyerId,
      productId: order.productId,
      auctionId: order.auctionId,
      amount: Number(order.amount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      cancelledAt: toISOString(order.cancelledAt),
      cancelledBy: order.cancelledBy,
      cancellationReason: order.cancellationReason,
      shippedAt: toISOString(order.shippedAt),
      deliveredAt: toISOString(order.deliveredAt),
      deletedAt: toISOString(order.deletedAt),
      deletedBy: order.deletedBy,
      createdAt: toISOString(order.createdAt) ?? '',
      updatedAt: toISOString(order.updatedAt) ?? '',
      completedAt: toISOString(order.completedAt),
      buyer: order.buyer
        ? {
            id: order.buyer.id,
            firstName: order.buyer.firstName,
            lastName: order.buyer.lastName,
            phoneNumber: order.buyer.phoneNumber,
          }
        : undefined,
      product: order.product
        ? {
            id: order.product.id,
            title: (order.product.title as string) ?? '',
            slug: order.product.slug,
            price:
              typeof order.product.price === 'number'
                ? order.product.price
                : Number(order.product.price) || 0,
            sellerId: order.product.sellerId,
            images: order.product.images?.map((img) => ({
              id: img.fileId,
              url: img.file?.url ?? '',
            })),
          }
        : undefined,
      auction: order.auction
        ? {
            id: order.auction.id,
            productId: order.auction.productId,
            status: order.auction.status,
          }
        : null,
      seller: order.seller
        ? {
            id: order.seller.id,
            firstName: order.seller.firstName,
            lastName: order.seller.lastName,
            phoneNumber: order.seller.phoneNumber,
          }
        : undefined,
      conversationId: order.conversations?.[0]?.id ?? null,
    };
  }
}
