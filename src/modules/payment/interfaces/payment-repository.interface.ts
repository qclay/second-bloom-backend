import { Payment } from '@prisma/client';
import {
  CreatePaymentData,
  UpdatePaymentData,
} from './create-payment-data.interface';
import { PaymentWithRelations } from './payment-with-relations.interface';

export interface IPaymentRepository {
  create(data: CreatePaymentData): Promise<Payment>;
  findById(id: string): Promise<PaymentWithRelations | null>;
  findByTransactionId(
    transactionId: string,
  ): Promise<PaymentWithRelations | null>;
  findByUserId(userId: string): Promise<Array<PaymentWithRelations>>;
  update(id: string, data: UpdatePaymentData): Promise<Payment>;
  findByInvoiceId(invoiceId: number): Promise<PaymentWithRelations | null>;
}
