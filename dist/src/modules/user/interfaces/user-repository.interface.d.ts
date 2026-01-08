import { User, Prisma } from '@prisma/client';
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    softDelete(id: string, deletedBy: string): Promise<User>;
    findMany(args: Prisma.UserFindManyArgs): Promise<User[]>;
    count(args: Prisma.UserCountArgs): Promise<number>;
    updateLastLogin(id: string): Promise<User>;
    updateAvatar(id: string, avatarId: string | null): Promise<User>;
    updateFcmToken(id: string, fcmToken: string | null): Promise<User>;
}
