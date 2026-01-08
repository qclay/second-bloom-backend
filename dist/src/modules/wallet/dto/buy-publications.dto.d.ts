import { PaymentMethod, PaymentGateway } from '@prisma/client';
export declare class BuyPublicationsDto {
    quantity: number;
    method: PaymentMethod;
    gateway?: PaymentGateway;
}
