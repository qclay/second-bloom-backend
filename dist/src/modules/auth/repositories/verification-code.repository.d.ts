import { PrismaService } from '../../../prisma/prisma.service';
import { IVerificationCodeRepository } from '../interfaces/verification-code-repository.interface';
import { VerificationCode, VerificationPurpose, Prisma } from '@prisma/client';
export declare class VerificationCodeRepository implements IVerificationCodeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.VerificationCodeCreateInput): Promise<VerificationCode>;
    findValid(phoneNumber: string, code: string, purpose: VerificationPurpose): Promise<VerificationCode | null>;
    markAsUsed(id: string): Promise<VerificationCode>;
    incrementAttempts(id: string): Promise<VerificationCode>;
    deleteExpired(): Promise<number>;
    findLatestByPhone(phoneNumber: string, purpose: VerificationPurpose): Promise<VerificationCode | null>;
}
