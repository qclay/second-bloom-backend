import { User } from '@prisma/client';

export class AuthResponseDto {
  user!: {
    id: string;
    phoneNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: string;
    isActive: boolean;
  };
  accessToken!: string;
  refreshToken!: string;

  static fromUser(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    };
  }
}
