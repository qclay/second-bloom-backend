import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IVerificationCodeRepository } from '../interfaces/verification-code-repository.interface';
import { VerificationCode, VerificationPurpose, Prisma } from '@prisma/client';
import { normalizePhoneNumber, normalizePhoneNumberForSearch } from '../../../common/utils/phone.util';

@Injectable()
export class VerificationCodeRepository implements IVerificationCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.VerificationCodeCreateInput,
  ): Promise<VerificationCode> {
    const normalizedData = {
      ...data,
      phoneNumber:
        typeof data.phoneNumber === 'string'
          ? normalizePhoneNumber(data.phoneNumber)
          : data.phoneNumber,
    };
    return this.prisma.verificationCode.create({
      data: normalizedData,
    });
  }

  async findValid(
    phoneNumber: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null> {
    const normalized = normalizePhoneNumberForSearch(phoneNumber);
    if (!normalized) {
      return null;
    }
    return this.prisma.verificationCode.findFirst({
      where: {
        phoneNumber: normalized,
        code,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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
    phoneNumber: string,
    purpose: VerificationPurpose,
  ): Promise<VerificationCode | null> {
    const normalized = normalizePhoneNumberForSearch(phoneNumber);
    if (!normalized) {
      return null;
    }
    return this.prisma.verificationCode.findFirst({
      where: {
        phoneNumber: normalized,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
