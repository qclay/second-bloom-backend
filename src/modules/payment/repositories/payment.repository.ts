import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IPaymentRepository,
  PaymentFindByUserIdOptions,
} from '../interfaces/payment-repository.interface';
import {
  CreatePaymentData,
  UpdatePaymentData,
} from '../interfaces/create-payment-data.interface';
import { PaymentWithRelations } from '../interfaces/payment-with-relations.interface';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePaymentData): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  findById(id: string): Promise<PaymentWithRelations | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            publicationCredits: true,
          },
        },
      },
    });
  }

  findByUserId(
    userId: string,
    options?: PaymentFindByUserIdOptions,
  ): Promise<PaymentWithRelations[]> {
    return this.prisma.payment.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      ...(options?.skip !== undefined && { skip: options.skip }),
      ...(options?.take !== undefined && { take: options.take }),
    });
  }

  countByUserId(userId: string): Promise<number> {
    return this.prisma.payment.count({
      where: { userId, isActive: true },
    });
  }

  update(id: string, data: UpdatePaymentData): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }
}
