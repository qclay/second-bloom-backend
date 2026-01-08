import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        region: string | null;
        id: string;
        phoneNumber: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        avatarId: string | null;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        rating: import("@prisma/client-runtime-utils").Decimal;
        totalRatings: number;
        refreshTokenVersion: number;
        city: string | null;
        district: string | null;
        fcmToken: string | null;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
        deletedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
