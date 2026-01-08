import { OrderStatus, PaymentStatus } from '@prisma/client';
export declare class OrderQueryDto {
    buyerId?: string;
    productId?: string;
    auctionId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    createdAfter?: string;
    createdBefore?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
