import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerificationCodeRepository } from '../repositories/verification-code.repository';
import { SmsService } from '../../../infrastructure/sms/sms.service';
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';
import { VerificationPurpose } from '@prisma/client';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly RATE_LIMIT_MINUTES = 4;

  constructor(
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly smsService: SmsService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(
    phoneCountryCode: string,
    phoneNumber: string,
    purpose: VerificationPurpose,
  ): Promise<{ code: string; expiresAt: Date }> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const rateLimitDisabled =
      this.configService.get<string>('OTP_RATE_LIMIT_DISABLED', 'false') ===
      'true';
    const isProduction = nodeEnv === 'production' || nodeEnv === 'staging';

    if (isProduction && !rateLimitDisabled) {
      const existingCode =
        await this.verificationCodeRepository.findLatestByPhone(
          phoneCountryCode,
          phoneNumber,
          purpose,
        );

      if (existingCode) {
        const timeDiff = existingCode.expiresAt.getTime() - Date.now();
        const minutesLeft = Math.floor(timeDiff / 60000);

        if (minutesLeft > this.OTP_EXPIRY_MINUTES - this.RATE_LIMIT_MINUTES) {
          throw new Error(
            `Please wait ${minutesLeft} minutes before requesting a new code`,
          );
        }
      }
    } else {
      this.logger.debug(
        `Development mode: OTP rate limiting disabled for ${phoneCountryCode}${phoneNumber}`,
      );
    }

    const code = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    await this.verificationCodeRepository.create({
      phoneCountryCode,
      phoneNumber,
      code,
      purpose,
      expiresAt,
      isUsed: false,
      attempts: 0,
      maxAttempts: 3,
      isActive: true,
    });

    this.logger.log(
      `🔐 OTP Generated: ${code} for ${phoneNumber} (${purpose}) - Expires: ${expiresAt.toISOString()}`,
    );

    const isProductionOnly = nodeEnv === 'production';

    Promise.all([
      this.telegramService.sendFormattedMessage(phoneNumber, code, purpose),
      isProductionOnly
        ? this.smsService.sendOtp(phoneNumber, code)
        : Promise.resolve(true),
    ]).catch((error) => {
      this.logger.error(
        `Failed to send OTP notifications to ${phoneNumber}`,
        error,
      );
    });

    return { code, expiresAt };
  }

  async verifyOtp(
    phoneCountryCode: string,
    phoneNumber: string,
    code: string,
    purpose: VerificationPurpose,
  ): Promise<boolean> {
    const verificationCode = await this.verificationCodeRepository.findValid(
      phoneCountryCode,
      phoneNumber,
      code,
      purpose,
    );

    if (!verificationCode) {
      return false;
    }

    if (verificationCode.attempts >= verificationCode.maxAttempts) {
      throw new Error('Maximum verification attempts exceeded');
    }

    await this.verificationCodeRepository.markAsUsed(verificationCode.id);
    return true;
  }
}
