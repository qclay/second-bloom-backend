import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { SendPhoneChangeOtpDto } from './dto/send-phone-change-otp.dto';
import { VerifyPhoneChangeDto } from './dto/verify-phone-change.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Prisma } from '@prisma/client';
import { UserRole, VerificationPurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IFirebaseService,
  FIREBASE_SERVICE_TOKEN,
} from '../../infrastructure/firebase/firebase-service.interface';
import { OtpService } from '../auth/services/otp.service';
import { MessageResponseDto } from '../auth/dto/message-response.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    @Inject(FIREBASE_SERVICE_TOKEN)
    private readonly firebaseService: IFirebaseService,
    private readonly otpService: OtpService,
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

  private async validateUsernameUniqueness(
    username: string,
    excludeUserId?: string,
  ): Promise<void> {
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername && existingUsername.id !== excludeUserId) {
      throw new ConflictException('User with this username already exists');
    }
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByPhoneNumber(
      dto.countryCode,
      dto.phoneNumber,
    );
    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }
    if (dto.email) {
      await this.validateEmailUniqueness(dto.email);
    }
    if (dto.username) {
      await this.validateUsernameUniqueness(dto.username);
    }
    const user = await this.userRepository.create({
      phoneCountryCode: dto.countryCode,
      phoneNumber: dto.phoneNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      username: dto.username,
      gender: dto.gender,
      language: dto.language,
      country: dto.country,
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
        { username: { contains: search, mode: 'insensitive' } },
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

    if (
      dto.username !== undefined &&
      dto.username !== null &&
      dto.username !== user.username
    ) {
      await this.validateUsernameUniqueness(dto.username, userId);
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

    if (dto.username && dto.username !== user.username) {
      await this.validateUsernameUniqueness(dto.username, id);
    }

    const updatedUser = await this.userRepository.update(id, dto);
    return UserResponseDto.fromEntity(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softDelete(id);
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

  private async validateAvatarExists(avatarId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: avatarId },
      select: { id: true, deletedAt: true },
    });
    return file !== null && file.deletedAt === null;
  }

  async sendPhoneChangeOtp(
    userId: string,
    dto: SendPhoneChangeOtpDto,
  ): Promise<MessageResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const currentFull = user.phoneCountryCode
      ? user.phoneCountryCode + user.phoneNumber
      : user.phoneNumber;
    const newFull = dto.newCountryCode + dto.newPhoneNumber;
    if (newFull === currentFull) {
      throw new BadRequestException(
        'New phone number must be different from current phone number',
      );
    }
    const existingUser = await this.userRepository.findByPhoneNumber(
      dto.newCountryCode,
      dto.newPhoneNumber,
    );
    if (existingUser) {
      throw new ConflictException('Phone number is already in use');
    }
    try {
      await this.otpService.sendOtp(
        dto.newCountryCode,
        dto.newPhoneNumber,
        VerificationPurpose.PHONE_CHANGE,
      );
      return {
        message: 'Verification code sent successfully to the new phone number',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Failed to send verification code');
    }
  }

  async verifyPhoneChange(
    userId: string,
    dto: VerifyPhoneChangeDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdWithAvatar(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const currentFull = user.phoneCountryCode
      ? user.phoneCountryCode + user.phoneNumber
      : user.phoneNumber;
    const newFull = dto.newCountryCode + dto.newPhoneNumber;
    if (newFull === currentFull) {
      throw new BadRequestException(
        'New phone number must be different from current phone number',
      );
    }
    const existingUser = await this.userRepository.findByPhoneNumber(
      dto.newCountryCode,
      dto.newPhoneNumber,
    );
    if (existingUser) {
      throw new ConflictException('Phone number is already in use');
    }
    const isValid = await this.otpService.verifyOtp(
      dto.newCountryCode,
      dto.newPhoneNumber,
      dto.code.toString(),
      VerificationPurpose.PHONE_CHANGE,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    await this.userRepository.updatePhoneNumber(
      userId,
      dto.newCountryCode,
      dto.newPhoneNumber,
    );
    this.logger.log(
      `Phone number updated for user ${userId} from ${currentFull} to ${newFull}`,
    );

    const userWithAvatar = await this.userRepository.findByIdWithAvatar(userId);
    if (!userWithAvatar) {
      throw new NotFoundException('User not found after update');
    }

    return UserResponseDto.fromEntity(userWithAvatar);
  }
}
