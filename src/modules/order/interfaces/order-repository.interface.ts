import { Order, Prisma } from '@prisma/client';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  create(data: Prisma.OrderCreateInput): Promise<Order>;
  update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;
  softDelete(id: string, deletedBy: string): Promise<Order>;
  findMany(args: Prisma.OrderFindManyArgs): Promise<Order[]>;
  count(args: Prisma.OrderCountArgs): Promise<number>;
  generateOrderNumber(): Promise<string>;
}
