import { VerificationCode, VerificationPurpose, Prisma } from '@prisma/client';

export interface IVerificationCodeRepository {
  create(data: Prisma.VerificationCodeCreateInput): Promise<VerificationCode>;
  findValid(
    countryCode: string,
    phoneNumber: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null>;
  markAsUsed(id: string): Promise<VerificationCode>;
  incrementAttempts(id: string): Promise<VerificationCode>;
  deleteExpired(): Promise<number>;
  findLatestByPhone(
    countryCode: string,
    phoneNumber: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null>;
}
