import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { Order, Prisma } from '@prisma/client';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
    });
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return this.prisma.order.create({
      data,
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'CANCELLED' as const,
        isActive: false,
      },
    });
  }

  async findMany(args: Prisma.OrderFindManyArgs): Promise<Order[]> {
    return this.prisma.order.findMany(args);
  }

  async count(args: Prisma.OrderCountArgs): Promise<number> {
    return this.prisma.order.count(args);
  }

  async generateOrderNumber(maxRetries = 10): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${random}`;

      const exists = await this.findByOrderNumber(orderNumber);
      if (!exists) {
        return orderNumber;
      }
    }

    throw new Error(
      `Failed to generate unique order number after ${maxRetries} attempts`,
    );
  }
}
