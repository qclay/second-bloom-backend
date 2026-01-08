import { PaymentMethod, PaymentGateway } from '@prisma/client';
export declare class CreatePaymentDto {
    orderId: string;
    method: PaymentMethod;
    gateway?: PaymentGateway;
    amount?: number;
}
