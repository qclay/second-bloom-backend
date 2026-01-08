import { Order } from '@prisma/client';
import { ProductNestedDto } from '../../product/dto/product-nested.dto';
export declare class OrderResponseDto {
    id: string;
    orderNumber: string;
    buyerId: string;
    productId: string;
    auctionId: string | null;
    amount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: string | null;
    notes: string | null;
    cancelledAt: Date | null;
    cancelledBy: string | null;
    cancellationReason: string | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    deletedAt: Date | null;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
    buyer?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    };
    product?: ProductNestedDto & {
        sellerId: string;
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
    static fromEntity(order: Order & {
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
            images?: Array<{
                file?: {
                    url: string;
                };
            }>;
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
    }): OrderResponseDto;
}
