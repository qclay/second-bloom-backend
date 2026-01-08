import { UserRole } from '@prisma/client';
export declare class UserQueryDto {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    isVerified?: boolean;
    page?: number;
    limit?: number;
}
