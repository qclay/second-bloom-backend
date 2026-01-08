import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ITelegramService } from './telegram-service.interface';
export declare class TelegramService implements ITelegramService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly botToken;
    private readonly chatId;
    private readonly enabled;
    private readonly apiUrl;
    constructor(configService: ConfigService, httpService: HttpService);
    sendOtp(phoneNumber: string, code: string): Promise<boolean>;
    sendFormattedMessage(phoneNumber: string, code: string, purpose?: string): Promise<boolean>;
    sendMessage(message: string): Promise<boolean>;
    private formatOtpMessage;
}
