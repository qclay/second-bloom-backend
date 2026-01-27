import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationCodeRepository } from './repositories/verification-code.repository';
import { OtpService } from './services/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { VerificationPurpose, UserRole } from '@prisma/client';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ErrorCode } from '../../common/constants/error-codes.constant';
import { normalizePhoneNumber } from '../../common/utils/phone.util';
import type { JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<MessageResponseDto> {
    try {
      const normalizedPhoneNumber = normalizePhoneNumber(dto.phoneNumber);
      await this.otpService.sendOtp(
        normalizedPhoneNumber,
        VerificationPurpose.SIGNUP,
      );
      return {
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Failed to send verification code');
    }
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const normalizedPhoneNumber = normalizePhoneNumber(dto.phoneNumber);

    const isValid = await this.otpService.verifyOtp(
      normalizedPhoneNumber,
      dto.code.toString(),
      VerificationPurpose.SIGNUP,
    );

    if (!isValid) {
      const error = new UnauthorizedException('Invalid or expired OTP code');
      (error as unknown as { code: ErrorCode }).code = ErrorCode.INVALID_OTP;
      throw error;
    }

    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber: normalizedPhoneNumber,
          role: UserRole.USER,
          isActive: true,
          isVerified: true,
        },
      });
    } else if (!user.isActive) {
      const error = new UnauthorizedException(
        'Account has been deactivated. Please contact support.',
      );
      (error as unknown as { code: ErrorCode }).code =
        ErrorCode.ACCOUNT_DEACTIVATED;
      throw error;
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    const tokens = await this.generateTokens(user);

    return AuthResponseDto.fromUser(
      user,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        const error = new UnauthorizedException('User not found');
        (error as unknown as { code: ErrorCode }).code =
          ErrorCode.USER_NOT_FOUND;
        throw error;
      }

      if (!user.isActive) {
        const error = new UnauthorizedException(
          'Account has been deactivated. Please contact support.',
        );
        (error as unknown as { code: ErrorCode }).code =
          ErrorCode.ACCOUNT_DEACTIVATED;
        throw error;
      }

      if (user.refreshTokenVersion !== payload.tokenVersion) {
        const error = new UnauthorizedException(
          'Refresh token has been revoked. Please login again.',
        );
        (error as unknown as { code: ErrorCode }).code =
          ErrorCode.REFRESH_TOKEN_REVOKED;
        throw error;
      }

      const tokens = await this.generateTokens(user);

      return AuthResponseDto.fromUser(
        user,
        tokens.accessToken,
        tokens.refreshToken,
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const unauthorizedError = new UnauthorizedException(
        'Invalid or expired refresh token',
      );
      (unauthorizedError as unknown as { code: ErrorCode }).code =
        ErrorCode.INVALID_REFRESH_TOKEN;
      throw unauthorizedError;
    }
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenVersion: {
          increment: 1,
        },
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: {
    id: string;
    phoneNumber: string;
    role: UserRole;
    refreshTokenVersion: number;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    };

    const accessSecret = this.configService.get<string>('jwt.secret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const accessExpiresIn = this.configService.get<string>(
      'jwt.expiresIn',
      '15m',
    );
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
      '7d',
    );

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessTokenOptions: JwtSignOptions = {
      secret: accessSecret,
      expiresIn: accessExpiresIn as StringValue,
    };

    const refreshTokenOptions: JwtSignOptions = {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as StringValue,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          phoneNumber: payload.phoneNumber,
          role: payload.role,
          tokenVersion: payload.tokenVersion,
        },
        accessTokenOptions,
      ),
      this.jwtService.signAsync(
        {
          sub: payload.sub,
          phoneNumber: payload.phoneNumber,
          role: payload.role,
          tokenVersion: payload.tokenVersion,
        },
        refreshTokenOptions,
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
