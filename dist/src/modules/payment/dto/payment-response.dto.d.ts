import { Payment } from '@prisma/client';
export declare class PaymentResponseDto {
    id: string;
    userId: string;
    paymentType: string;
    amount: number;
    quantity: number;
    method: string;
    gateway: string | null;
    transactionId: string | null;
    gatewayTransactionId: string | null;
    gatewayOrderId: string | null;
    status: string;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(payment: Payment): PaymentResponseDto;
}
