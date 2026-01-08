import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationCodeRepository } from './repositories/verification-code.repository';
import { OtpService } from './services/otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly verificationCodeRepository;
    private readonly otpService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, verificationCodeRepository: VerificationCodeRepository, otpService: OtpService);
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
