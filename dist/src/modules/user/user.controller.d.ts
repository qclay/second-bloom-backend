import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(query: UserQueryDto): Promise<{
        data: UserResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProfile(user: {
        id: string;
    }): Promise<UserResponseDto>;
    updateProfile(user: {
        id: string;
    }, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto>;
    findOne(id: string, user: {
        id: string;
    }): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto, user: {
        id: string;
    }): Promise<UserResponseDto>;
    updateFcmToken(user: {
        id: string;
    }, updateFcmTokenDto: UpdateFcmTokenDto): Promise<UserResponseDto>;
    removeFcmToken(user: {
        id: string;
    }): Promise<UserResponseDto>;
    remove(id: string, user: {
        id: string;
    }): Promise<void>;
}
