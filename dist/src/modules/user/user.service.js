"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("./repositories/user.repository");
const user_response_dto_1 = require("./dto/user-response.dto");
const client_1 = require("@prisma/client");
const firebase_service_interface_1 = require("../../infrastructure/firebase/firebase-service.interface");
let UserService = UserService_1 = class UserService {
    userRepository;
    firebaseService;
    logger = new common_1.Logger(UserService_1.name);
    constructor(userRepository, firebaseService) {
        this.userRepository = userRepository;
        this.firebaseService = firebaseService;
    }
    async validateEmailUniqueness(email, excludeUserId) {
        const existingEmail = await this.userRepository.findByEmail(email);
        if (existingEmail && existingEmail.id !== excludeUserId) {
            throw new common_1.ConflictException('User with this email already exists');
        }
    }
    async createUser(dto) {
        const existingUser = await this.userRepository.findByPhoneNumber(dto.phoneNumber);
        if (existingUser) {
            throw new common_1.ConflictException('User with this phone number already exists');
        }
        if (dto.email) {
            await this.validateEmailUniqueness(dto.email);
        }
        const user = await this.userRepository.create({
            phoneNumber: dto.phoneNumber,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
        });
        return user_response_dto_1.UserResponseDto.fromEntity(user);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, role, isActive, isVerified } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { phoneNumber: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (isVerified !== undefined) {
            where.isVerified = isVerified;
        }
        const [users, total] = await Promise.all([
            this.userRepository.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy: { createdAt: 'desc' },
            }),
            this.userRepository.count({ where }),
        ]);
        return {
            data: users.map((user) => user_response_dto_1.UserResponseDto.fromEntity(user)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id, currentUserId) {
        if (!currentUserId) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (user.deletedAt) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (currentUserId !== id) {
            const currentUser = await this.userRepository.findById(currentUserId);
            if (!currentUser || currentUser.role !== client_1.UserRole.ADMIN) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return user_response_dto_1.UserResponseDto.fromEntity(user);
    }
    async findProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        return user_response_dto_1.UserResponseDto.fromEntity(user);
    }
    async updateProfile(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== user.email) {
            await this.validateEmailUniqueness(dto.email, userId);
        }
        const updatedUser = await this.userRepository.update(userId, dto);
        return user_response_dto_1.UserResponseDto.fromEntity(updatedUser);
    }
    async updateUser(id, dto, currentUserId) {
        const currentUser = await this.userRepository.findById(currentUserId);
        if (currentUser?.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can update other users');
        }
        const user = await this.userRepository.findById(id);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (dto.email && dto.email !== user.email) {
            await this.validateEmailUniqueness(dto.email, id);
        }
        const updatedUser = await this.userRepository.update(id, dto);
        return user_response_dto_1.UserResponseDto.fromEntity(updatedUser);
    }
    async deleteUser(id, currentUserId) {
        const currentUser = await this.userRepository.findById(currentUserId);
        if (currentUser?.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can delete users');
        }
        const user = await this.userRepository.findById(id);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.softDelete(id, currentUserId);
    }
    async updateAvatar(userId, avatarId) {
        const user = await this.userRepository.findById(userId);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.userRepository.updateAvatar(userId, avatarId);
        return user_response_dto_1.UserResponseDto.fromEntity(updatedUser);
    }
    async updateLastLogin(userId) {
        await this.userRepository.updateLastLogin(userId);
    }
    async updateFcmToken(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.fcmToken) {
            const isValid = this.firebaseService.validateToken(dto.fcmToken);
            if (!isValid) {
                this.logger.warn(`Invalid FCM token format provided by user ${userId}. Token will be saved but may not work.`);
            }
        }
        const updatedUser = await this.userRepository.updateFcmToken(userId, dto.fcmToken || null);
        this.logger.log(`FCM token updated for user ${userId}`);
        return user_response_dto_1.UserResponseDto.fromEntity(updatedUser);
    }
    async removeFcmToken(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.userRepository.updateFcmToken(userId, null);
        this.logger.log(`FCM token removed for user ${userId}`);
        return user_response_dto_1.UserResponseDto.fromEntity(updatedUser);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(firebase_service_interface_1.FIREBASE_SERVICE_TOKEN)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository, Object])
], UserService);
//# sourceMappingURL=user.service.js.map