import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISmsService } from './sms-service.interface';
import { retry, CircuitBreaker } from '../../common/utils/retry.util';

@Injectable()
export class SmsService implements ISmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly smsApiUrl: string;
  private readonly smsApiKey: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.smsApiUrl = this.configService.get<string>('sms.url', '');
    this.smsApiKey = this.configService.get<string>('sms.apiKey', '');
    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
  }

  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your verification code is: ${code}`;
    return this.sendMessage(phoneNumber, message);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.smsApiUrl || !this.smsApiKey) {
      this.logger.warn(
        `SMS service not configured. Message to ${phoneNumber}: ${message}`,
      );
      return true;
    }

    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const response = await firstValueFrom(
              this.httpService.post(
                this.smsApiUrl,
                {
                  phone: phoneNumber,
                  message,
                },
                {
                  headers: {
                    Authorization: `Bearer ${this.smsApiKey}`,
                  },
                },
              ),
            );

            this.logger.log(`SMS sent to ${phoneNumber}`);
            return response.status === 200;
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying SMS send (attempt ${attempt}/3) to ${phoneNumber}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}`, error);
      return false;
    }
  }
}
