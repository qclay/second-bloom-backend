import { Payment, User } from '@prisma/client';

export type PaymentWithRelations = Payment & {
  user?: Partial<User>;
};
