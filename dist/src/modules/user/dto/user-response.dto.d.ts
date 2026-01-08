import { User } from '@prisma/client';
export declare class UserResponseDto {
    id: string;
    phoneNumber: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    avatarId: string | null;
    isVerified: boolean;
    isActive: boolean;
    role: string;
    rating: number;
    totalRatings: number;
    region: string | null;
    city: string | null;
    district: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(user: User): UserResponseDto;
}
