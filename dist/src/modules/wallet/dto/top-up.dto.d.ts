import { PaymentMethod, PaymentGateway } from '@prisma/client';
export declare class TopUpDto {
    amount: number;
    method: PaymentMethod;
    gateway?: PaymentGateway;
}
