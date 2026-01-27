import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IVerificationCodeRepository } from '../interfaces/verification-code-repository.interface';
import { VerificationCode, VerificationPurpose, Prisma } from '@prisma/client';

@Injectable()
export class VerificationCodeRepository implements IVerificationCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.VerificationCodeCreateInput,
  ): Promise<VerificationCode> {
    return this.prisma.verificationCode.create({
      data,
    });
  }

  async findValid(
    phoneCountryCode: string,
    phoneNumber: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null> {
    return this.prisma.verificationCode.findFirst({
      where: {
        phoneCountryCode,
        phoneNumber,
        code,
        purpose,
        isUsed: false,
        isActive: true,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsUsed(id: string): Promise<VerificationCode> {
    return this.prisma.verificationCode.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  async incrementAttempts(id: string): Promise<VerificationCode> {
    return this.prisma.verificationCode.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  async findLatestByPhone(
    phoneCountryCode: string,
    phoneNumber: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null> {
    return this.prisma.verificationCode.findFirst({
      where: {
        phoneCountryCode,
        phoneNumber,
        purpose,
        isUsed: false,
        isActive: true,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
