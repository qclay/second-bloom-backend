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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const retry_util_1 = require("../../common/utils/retry.util");
let SmsService = SmsService_1 = class SmsService {
    configService;
    httpService;
    logger = new common_1.Logger(SmsService_1.name);
    smsApiUrl;
    smsApiKey;
    circuitBreaker;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.smsApiUrl = this.configService.get('sms.url', '');
        this.smsApiKey = this.configService.get('sms.apiKey', '');
        this.circuitBreaker = new retry_util_1.CircuitBreaker(5, 60000, this.logger);
    }
    async sendOtp(phoneNumber, code) {
        const message = `Your verification code is: ${code}`;
        return this.sendMessage(phoneNumber, message);
    }
    async sendMessage(phoneNumber, message) {
        if (!this.smsApiUrl || !this.smsApiKey) {
            this.logger.warn(`SMS service not configured. Message to ${phoneNumber}: ${message}`);
            return true;
        }
        try {
            return await this.circuitBreaker.execute(async () => {
                return (0, retry_util_1.retry)(async () => {
                    const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.smsApiUrl, {
                        phone: phoneNumber,
                        message,
                    }, {
                        headers: {
                            Authorization: `Bearer ${this.smsApiKey}`,
                        },
                    }));
                    this.logger.log(`SMS sent to ${phoneNumber}`);
                    return response.status === 200;
                }, {
                    maxAttempts: 3,
                    delay: 1000,
                    backoff: 'exponential',
                    onRetry: (error, attempt) => {
                        this.logger.warn(`Retrying SMS send (attempt ${attempt}/3) to ${phoneNumber}`, error.message);
                    },
                });
            });
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${phoneNumber}`, error);
            return false;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], SmsService);
//# sourceMappingURL=sms.service.js.map