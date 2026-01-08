import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  role: UserRole;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}
