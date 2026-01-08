import { OrderStatus, PaymentStatus } from '@prisma/client';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    shippingAddress?: string;
    notes?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancellationReason?: string;
}
