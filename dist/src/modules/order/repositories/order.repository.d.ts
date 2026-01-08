import { PrismaService } from '../../../prisma/prisma.service';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { Order, Prisma } from '@prisma/client';
export declare class OrderRepository implements IOrderRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Order | null>;
    findByOrderNumber(orderNumber: string): Promise<Order | null>;
    create(data: Prisma.OrderCreateInput): Promise<Order>;
    update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;
    softDelete(id: string, deletedBy: string): Promise<Order>;
    findMany(args: Prisma.OrderFindManyArgs): Promise<Order[]>;
    count(args: Prisma.OrderCountArgs): Promise<number>;
    generateOrderNumber(maxRetries?: number): Promise<string>;
}
