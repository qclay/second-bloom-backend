import { PaymentStatus, PaymentMethod, PaymentGateway } from '@prisma/client';
export declare class PaymentQueryDto {
    status?: PaymentStatus;
    method?: PaymentMethod;
    gateway?: PaymentGateway;
    transactionId?: string;
    paidAfter?: string;
    paidBefore?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
