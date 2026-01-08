import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ISmsService } from './sms-service.interface';
export declare class SmsService implements ISmsService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly smsApiUrl;
    private readonly smsApiKey;
    private readonly circuitBreaker;
    constructor(configService: ConfigService, httpService: HttpService);
    sendOtp(phoneNumber: string, code: string): Promise<boolean>;
    sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}
