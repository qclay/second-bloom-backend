import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { IFirebaseService } from '../../infrastructure/firebase/firebase-service.interface';
export declare class UserService {
    private readonly userRepository;
    private readonly firebaseService;
    private readonly logger;
    constructor(userRepository: UserRepository, firebaseService: IFirebaseService);
    private validateEmailUniqueness;
    createUser(dto: CreateUserDto): Promise<UserResponseDto>;
    findAll(query: UserQueryDto): Promise<{
        data: UserResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, currentUserId?: string): Promise<UserResponseDto>;
    findProfile(userId: string): Promise<UserResponseDto>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto>;
    updateUser(id: string, dto: UpdateUserDto, currentUserId: string): Promise<UserResponseDto>;
    deleteUser(id: string, currentUserId: string): Promise<void>;
    updateAvatar(userId: string, avatarId: string | null): Promise<UserResponseDto>;
    updateLastLogin(userId: string): Promise<void>;
    updateFcmToken(userId: string, dto: UpdateFcmTokenDto): Promise<UserResponseDto>;
    removeFcmToken(userId: string): Promise<UserResponseDto>;
}
