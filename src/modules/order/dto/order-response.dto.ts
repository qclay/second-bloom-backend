import { Order } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ProductNestedDto } from '../../product/dto/product-nested.dto';

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

  @ApiProperty()
  status!: string;

  @ApiProperty()
  paymentStatus!: string;

  @ApiProperty({ nullable: true })
  shippingAddress!: string | null;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty({ nullable: true })
  cancelledBy!: string | null;

  @ApiProperty({ nullable: true })
  cancellationReason!: string | null;

  @ApiProperty({ nullable: true })
  shippedAt!: Date | null;

  @ApiProperty({ nullable: true })
  deliveredAt!: Date | null;

  @ApiProperty({ nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ nullable: true })
  deletedBy!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  completedAt!: Date | null;

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
        title: string;
        slug: string;
        price: unknown;
        sellerId: string;
        images?: Array<{ file?: { url: string } }>;
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
      cancelledAt: order.cancelledAt,
      cancelledBy: order.cancelledBy,
      cancellationReason: order.cancellationReason,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      deletedAt: order.deletedAt,
      deletedBy: order.deletedBy,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,
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
            title: order.product.title,
            slug: order.product.slug,
            price:
              typeof order.product.price === 'number'
                ? order.product.price
                : Number(order.product.price) || 0,
            sellerId: order.product.sellerId,
            images: order.product.images?.map((img) => ({
              url: img.file?.url,
            })) as Array<{ url?: string }>,
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
    };
  }
}
