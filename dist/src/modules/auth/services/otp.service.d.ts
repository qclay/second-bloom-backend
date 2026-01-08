import { ConfigService } from '@nestjs/config';
import { VerificationCodeRepository } from '../repositories/verification-code.repository';
import { SmsService } from '../../../infrastructure/sms/sms.service';
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';
import { VerificationPurpose } from '@prisma/client';
export declare class OtpService {
    private readonly verificationCodeRepository;
    private readonly smsService;
    private readonly telegramService;
    private readonly configService;
    private readonly logger;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly OTP_LENGTH;
    private readonly RATE_LIMIT_MINUTES;
    constructor(verificationCodeRepository: VerificationCodeRepository, smsService: SmsService, telegramService: TelegramService, configService: ConfigService);
    generateOtp(): string;
    sendOtp(phoneNumber: string, purpose: VerificationPurpose): Promise<{
        code: string;
        expiresAt: Date;
    }>;
    verifyOtp(phoneNumber: string, code: string, purpose: VerificationPurpose): Promise<boolean>;
}
