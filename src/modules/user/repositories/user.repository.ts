import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithAvatar(
    id: string,
  ): Promise<(User & { avatar: { url: string } | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        avatar: {
          select: {
            url: true,
          },
        },
      },
    }) as Promise<(User & { avatar: { url: string } | null }) | null>;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        isActive: false,
      },
    });
  }

  async findMany(args: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  async count(args: Prisma.UserCountArgs): Promise<number> {
    return this.prisma.user.count(args);
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async updateAvatar(id: string, avatarId: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        avatarId,
      },
    });
  }

  async updateFcmToken(id: string, fcmToken: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        fcmToken,
      },
    });
  }
}
