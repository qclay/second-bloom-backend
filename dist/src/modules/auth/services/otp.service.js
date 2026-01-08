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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const verification_code_repository_1 = require("../repositories/verification-code.repository");
const sms_service_1 = require("../../../infrastructure/sms/sms.service");
const telegram_service_1 = require("../../../infrastructure/telegram/telegram.service");
let OtpService = OtpService_1 = class OtpService {
    verificationCodeRepository;
    smsService;
    telegramService;
    configService;
    logger = new common_1.Logger(OtpService_1.name);
    OTP_EXPIRY_MINUTES = 5;
    OTP_LENGTH = 6;
    RATE_LIMIT_MINUTES = 4;
    constructor(verificationCodeRepository, smsService, telegramService, configService) {
        this.verificationCodeRepository = verificationCodeRepository;
        this.smsService = smsService;
        this.telegramService = telegramService;
        this.configService = configService;
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOtp(phoneNumber, purpose) {
        const nodeEnv = this.configService.get('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production' || nodeEnv === 'staging';
        if (isProduction) {
            const existingCode = await this.verificationCodeRepository.findLatestByPhone(phoneNumber, purpose);
            if (existingCode) {
                const timeDiff = existingCode.expiresAt.getTime() - Date.now();
                const minutesLeft = Math.floor(timeDiff / 60000);
                if (minutesLeft > this.OTP_EXPIRY_MINUTES - this.RATE_LIMIT_MINUTES) {
                    throw new Error(`Please wait ${minutesLeft} minutes before requesting a new code`);
                }
            }
        }
        else {
            this.logger.debug(`Development mode: OTP rate limiting disabled for ${phoneNumber}`);
        }
        const code = this.generateOtp();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);
        await this.verificationCodeRepository.create({
            phoneNumber,
            code,
            purpose,
            expiresAt,
            isUsed: false,
            attempts: 0,
            maxAttempts: 3,
        });
        this.logger.log(`🔐 OTP Generated: ${code} for ${phoneNumber} (${purpose}) - Expires: ${expiresAt.toISOString()}`);
        await Promise.all([
            this.smsService.sendOtp(phoneNumber, code),
            this.telegramService.sendFormattedMessage(phoneNumber, code, purpose),
        ]);
        return { code, expiresAt };
    }
    async verifyOtp(phoneNumber, code, purpose) {
        const verificationCode = await this.verificationCodeRepository.findValid(phoneNumber, code, purpose);
        if (!verificationCode) {
            return false;
        }
        if (verificationCode.attempts >= verificationCode.maxAttempts) {
            throw new Error('Maximum verification attempts exceeded');
        }
        await this.verificationCodeRepository.markAsUsed(verificationCode.id);
        return true;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [verification_code_repository_1.VerificationCodeRepository,
        sms_service_1.SmsService,
        telegram_service_1.TelegramService,
        config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map