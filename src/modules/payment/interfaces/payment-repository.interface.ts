import { Payment } from '@prisma/client';
import {
  CreatePaymentData,
  UpdatePaymentData,
} from './create-payment-data.interface';
import { PaymentWithRelations } from './payment-with-relations.interface';

export interface PaymentFindByUserIdOptions {
  skip?: number;
  take?: number;
}

export interface IPaymentRepository {
  create(data: CreatePaymentData): Promise<Payment>;
  findById(id: string): Promise<PaymentWithRelations | null>;
  findByUserId(
    userId: string,
    options?: PaymentFindByUserIdOptions,
  ): Promise<Array<PaymentWithRelations>>;
  countByUserId(userId: string): Promise<number>;
  update(id: string, data: UpdatePaymentData): Promise<Payment>;
}
