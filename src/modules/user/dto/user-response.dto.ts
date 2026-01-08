import { User } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  phoneNumber!: string;
  firstName!: string | null;
  lastName!: string | null;
  email!: string | null;
  avatarId!: string | null;
  isVerified!: boolean;
  isActive!: boolean;
  role!: string;
  rating!: number;
  totalRatings!: number;
  region!: string | null;
  city!: string | null;
  district!: string | null;
  lastLoginAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarId: user.avatarId,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.role,
      rating: Number(user.rating),
      totalRatings: user.totalRatings,
      region: user.region,
      city: user.city,
      district: user.district,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
