import { User } from '@prisma/client';
export declare class AuthResponseDto {
    user: {
        id: string;
        phoneNumber: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        role: string;
        isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
    static fromUser(user: User, accessToken: string, refreshToken: string): AuthResponseDto;
}
