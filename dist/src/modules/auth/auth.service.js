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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const verification_code_repository_1 = require("./repositories/verification-code.repository");
const otp_service_1 = require("./services/otp.service");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const client_1 = require("@prisma/client");
const error_codes_constant_1 = require("../../common/constants/error-codes.constant");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    verificationCodeRepository;
    otpService;
    constructor(prisma, jwtService, configService, verificationCodeRepository, otpService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.verificationCodeRepository = verificationCodeRepository;
        this.otpService = otpService;
    }
    async sendOtp(dto) {
        try {
            await this.otpService.sendOtp(dto.phoneNumber, client_1.VerificationPurpose.SIGNUP);
            return {
                message: 'Verification code sent successfully',
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(error.message);
            }
            throw new common_1.BadRequestException('Failed to send verification code');
        }
    }
    async verifyOtp(dto) {
        const isValid = await this.otpService.verifyOtp(dto.phoneNumber, dto.code, client_1.VerificationPurpose.SIGNUP);
        if (!isValid) {
            const error = new common_1.UnauthorizedException('Invalid or expired OTP code');
            error.code = error_codes_constant_1.ErrorCode.INVALID_OTP;
            throw error;
        }
        let user = await this.prisma.user.findUnique({
            where: { phoneNumber: dto.phoneNumber },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    phoneNumber: dto.phoneNumber,
                    role: client_1.UserRole.USER,
                    isActive: true,
                    isVerified: true,
                },
            });
        }
        else if (!user.isActive) {
            const error = new common_1.UnauthorizedException('Account has been deactivated. Please contact support.');
            error.code =
                error_codes_constant_1.ErrorCode.ACCOUNT_DEACTIVATED;
            throw error;
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true },
            });
        }
        const tokens = await this.generateTokens(user);
        return auth_response_dto_1.AuthResponseDto.fromUser(user, tokens.accessToken, tokens.refreshToken);
    }
    async refreshToken(dto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                const error = new common_1.UnauthorizedException('User not found');
                error.code =
                    error_codes_constant_1.ErrorCode.USER_NOT_FOUND;
                throw error;
            }
            if (!user.isActive) {
                const error = new common_1.UnauthorizedException('Account has been deactivated. Please contact support.');
                error.code =
                    error_codes_constant_1.ErrorCode.ACCOUNT_DEACTIVATED;
                throw error;
            }
            if (user.refreshTokenVersion !== payload.tokenVersion) {
                const error = new common_1.UnauthorizedException('Refresh token has been revoked. Please login again.');
                error.code =
                    error_codes_constant_1.ErrorCode.REFRESH_TOKEN_REVOKED;
                throw error;
            }
            const tokens = await this.generateTokens(user);
            return auth_response_dto_1.AuthResponseDto.fromUser(user, tokens.accessToken, tokens.refreshToken);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            const unauthorizedError = new common_1.UnauthorizedException('Invalid or expired refresh token');
            unauthorizedError.code =
                error_codes_constant_1.ErrorCode.INVALID_REFRESH_TOKEN;
            throw unauthorizedError;
        }
    }
    async logout(userId) {
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
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            phoneNumber: user.phoneNumber,
            role: user.role,
            tokenVersion: user.refreshTokenVersion,
        };
        const accessSecret = this.configService.get('jwt.secret');
        const refreshSecret = this.configService.get('jwt.refreshSecret');
        const accessExpiresIn = this.configService.get('jwt.expiresIn', '15m');
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn', '7d');
        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT secrets are not configured');
        }
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: payload.sub,
                phoneNumber: payload.phoneNumber,
                role: payload.role,
                tokenVersion: payload.tokenVersion,
            }, {
                secret: accessSecret,
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync({
                sub: payload.sub,
                phoneNumber: payload.phoneNumber,
                role: payload.role,
                tokenVersion: payload.tokenVersion,
            }, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn,
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        verification_code_repository_1.VerificationCodeRepository,
        otp_service_1.OtpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map