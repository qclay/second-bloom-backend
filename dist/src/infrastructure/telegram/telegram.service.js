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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let TelegramService = TelegramService_1 = class TelegramService {
    configService;
    httpService;
    logger = new common_1.Logger(TelegramService_1.name);
    botToken;
    chatId;
    enabled;
    apiUrl;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.botToken = this.configService.get('telegram.botToken', '');
        this.chatId = this.configService.get('telegram.chatId', '');
        this.enabled = this.configService.get('telegram.enabled', false);
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
        if (this.enabled && this.botToken && this.chatId) {
            this.logger.log('Telegram service initialized successfully');
        }
        else {
            this.logger.warn('Telegram service is not configured or disabled');
        }
    }
    async sendOtp(phoneNumber, code) {
        const message = this.formatOtpMessage(phoneNumber, code);
        return this.sendMessage(message);
    }
    async sendFormattedMessage(phoneNumber, code, purpose) {
        const message = this.formatOtpMessage(phoneNumber, code, purpose);
        return this.sendMessage(message);
    }
    async sendMessage(message) {
        if (!this.enabled || !this.botToken) {
            this.logger.warn(`Telegram service not configured. Would send: ${message}`);
            return true;
        }
        if (!this.chatId) {
            this.logger.error('Telegram chat ID not configured');
            return false;
        }
        try {
            const url = `${this.apiUrl}/sendMessage`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML',
            }));
            if (response.data.ok) {
                this.logger.log('OTP sent to Telegram channel successfully');
                return true;
            }
            else {
                this.logger.error('Telegram API returned error', response.data);
                return false;
            }
        }
        catch (error) {
            if (error.response) {
                this.logger.error('Failed to send message to Telegram', error.response.data);
            }
            else {
                this.logger.error('Failed to send message to Telegram', error.message);
            }
            return false;
        }
    }
    formatOtpMessage(phoneNumber, code, purpose) {
        const purposeText = purpose ? ` (${purpose})` : '';
        return `
🔐 <b>New OTP Request${purposeText}</b>

📱 <b>Phone:</b> <code>${phoneNumber}</code>
🔢 <b>Code:</b> <code>${code}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' })}
⏳ <b>Valid for:</b> 5 minutes

<i>This code will expire in 5 minutes.</i>
    `.trim();
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map