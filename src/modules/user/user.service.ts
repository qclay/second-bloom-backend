import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Prisma } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IFirebaseService,
  FIREBASE_SERVICE_TOKEN,
} from '../../infrastructure/firebase/firebase-service.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
  ) {}

  private async validateEmailUniqueness(
    email: string,
    excludeUserId?: string,
  ): Promise<void> {
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail && existingEmail.id !== excludeUserId) {
      throw new ConflictException('User with this email already exists');
    }
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByPhoneNumber(
      dto.phoneNumber,
    );

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
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

    return UserResponseDto.fromEntity(user);
  }

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, role, isActive, isVerified } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.UserWhereInput = {
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
      data: users.map((user) => UserResponseDto.fromEntity(user)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async findById(id: string, currentUserId?: string): Promise<UserResponseDto> {
    if (!currentUserId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUserId !== id) {
      const currentUser = await this.userRepository.findById(currentUserId);
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Access denied');
      }
    }

    return UserResponseDto.fromEntity(user);
  }

  async findProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdWithAvatar(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdWithAvatar(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (
      dto.email !== undefined &&
      dto.email !== null &&
      dto.email !== user.email
    ) {
      await this.validateEmailUniqueness(dto.email, userId);
    }

    if (dto.avatarId !== undefined && dto.avatarId !== null) {
      const avatarExists = await this.validateAvatarExists(dto.avatarId);
      if (!avatarExists) {
        throw new NotFoundException('Avatar file not found');
      }
    }

    await this.userRepository.update(userId, dto);
    const updatedUser = await this.userRepository.findByIdWithAvatar(userId);

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return UserResponseDto.fromEntity(updatedUser);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string,
  ): Promise<UserResponseDto> {
    const currentUser = await this.userRepository.findById(currentUserId);

    if (currentUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update other users');
    }

    const user = await this.userRepository.findById(id);

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== user.email) {
      await this.validateEmailUniqueness(dto.email, id);
    }

    const updatedUser = await this.userRepository.update(id, dto);
    return UserResponseDto.fromEntity(updatedUser);
  }

  async deleteUser(id: string, currentUserId: string): Promise<void> {
    const currentUser = await this.userRepository.findById(currentUserId);

    if (currentUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    const user = await this.userRepository.findById(id);

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softDelete(id, currentUserId);
  }

  async updateAvatar(
    userId: string,
    avatarId: string | null,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.updateAvatar(
      userId,
      avatarId,
    );
    return UserResponseDto.fromEntity(updatedUser);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }

  async updateFcmToken(
    userId: string,
    dto: UpdateFcmTokenDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (dto.fcmToken) {
      const isValid = this.firebaseService.validateToken(dto.fcmToken);
      if (!isValid) {
        this.logger.warn(
          `Invalid FCM token format provided by user ${userId}. Token will be saved but may not work.`,
        );
      }
    }

    const updatedUser = await this.userRepository.updateFcmToken(
      userId,
      dto.fcmToken || null,
    );

    this.logger.log(`FCM token updated for user ${userId}`);

    return UserResponseDto.fromEntity(updatedUser);
  }

  async removeFcmToken(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.updateFcmToken(userId, null);

    this.logger.log(`FCM token removed for user ${userId}`);

    return UserResponseDto.fromEntity(updatedUser);
  }

  private async validateAvatarExists(avatarId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: avatarId },
    });
    return file !== null && file.deletedAt === null;
  }
}
