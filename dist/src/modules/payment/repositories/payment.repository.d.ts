import { PrismaService } from '../../../prisma/prisma.service';
import { IPaymentRepository } from '../interfaces/payment-repository.interface';
import { Payment, Prisma } from '@prisma/client';
export declare class PaymentRepository implements IPaymentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Payment | null>;
    findByTransactionId(transactionId: string): Promise<Payment | null>;
    findByGatewayTransactionId(gatewayTransactionId: string, gateway: string): Promise<Payment | null>;
    create(data: Prisma.PaymentCreateInput): Promise<Payment>;
    update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>;
    findMany(args: Prisma.PaymentFindManyArgs): Promise<Payment[]>;
    count(args: Prisma.PaymentCountArgs): Promise<number>;
}
