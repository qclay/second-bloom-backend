import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISmsService } from './sms-service.interface';
import { retry, CircuitBreaker } from '../../common/utils/retry.util';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data');

interface EskizTokenResponse {
  data: {
    token: string;
  };
  message?: string;
}

interface EskizSendSmsResponse {
  status: string;
  message?: {
    id: string;
    status: string;
  };
}

@Injectable()
export class SmsService implements ISmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string;
  private readonly email: string;
  private readonly password: string;
  private readonly senderId: string;
  private readonly circuitBreaker: CircuitBreaker;
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>(
      'sms.apiUrl',
      'https://notify.eskiz.uz/api',
    );
    this.email = this.configService.get<string>('sms.email', '');
    this.password = this.configService.get<string>('sms.password', '');
    this.senderId = this.configService.get<string>('sms.senderId', '4546');
    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
  }

  async sendOtp(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Код для входа в приложение SecondBloom: ${code}`;
    return this.sendMessage(phoneNumber, message);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';

    if (!isProduction) {
      this.logger.debug(
        `SMS service: Skipping SMS in ${nodeEnv} environment. Message to ${phoneNumber}: ${message}`,
      );
      return true;
    }

    if (!this.email || !this.password) {
      this.logger.warn(
        `Eskiz SMS service not configured. Message to ${phoneNumber}: ${message}`,
      );
      return true;
    }

    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const token = await this.getValidToken();
            if (!token) {
              this.logger.error('Failed to obtain Eskiz token');
              return false;
            }

            const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
            if (!normalizedPhone) {
              this.logger.error(`Invalid phone number format: ${phoneNumber}`);
              return false;
            }

            const formData = new FormData();
            formData.append('mobile_phone', normalizedPhone);
            formData.append('message', message);
            formData.append('from', this.senderId);

            const response = await firstValueFrom(
              this.httpService.post<EskizSendSmsResponse>(
                `${this.apiUrl}/message/sms/send`,
                formData,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    ...formData.getHeaders(),
                  },
                },
              ),
            );

            if (
              response.status === 200 &&
              (response.data.status === 'success' ||
                response.data.status === 'waiting' ||
                response.data?.message?.id)
            ) {
              this.logger.log(
                `SMS sent to ${phoneNumber} via Eskiz. Status: ${response.data.status}`,
              );
              return true;
            }

            this.logger.warn(
              `Eskiz API returned non-success status: ${response.data.status || 'unknown'}`,
            );
            return false;
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
    } catch (error: unknown) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}`, error);
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 401
      ) {
        this.token = null;
        this.tokenExpiresAt = 0;
      }
      return false;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    try {
      const loginFormData = new FormData();
      loginFormData.append('email', this.email);
      loginFormData.append('password', this.password);

      const response = await firstValueFrom(
        this.httpService.post<EskizTokenResponse>(
          `${this.apiUrl}/auth/login`,
          loginFormData,
          {
            headers: {
              ...loginFormData.getHeaders(),
            },
          },
        ),
      );

      if (response.data?.data?.token) {
        this.token = response.data.data.token;
        this.tokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        this.logger.log('Eskiz token obtained successfully');
        return this.token;
      }

      this.logger.error('Failed to get token from Eskiz API', response.data);
      return null;
    } catch (error) {
      this.logger.error('Error obtaining Eskiz token', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    if (!this.token) {
      return this.getValidToken();
    }

    try {
      const response = await firstValueFrom(
        this.httpService.patch<EskizTokenResponse>(
          `${this.apiUrl}/auth/user`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        ),
      );

      if (response.data?.data?.token) {
        this.token = response.data.data.token;
        this.tokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        this.logger.log('Eskiz token refreshed successfully');
        return this.token;
      }

      this.logger.warn('Token refresh failed, getting new token');
      this.token = null;
      return this.getValidToken();
    } catch (error) {
      this.logger.warn('Error refreshing token, getting new token', error);
      this.token = null;
      return this.getValidToken();
    }
  }

  private normalizePhoneNumber(phoneNumber: string): string | null {
    let normalized = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    if (normalized.startsWith('+998')) {
      normalized = normalized.substring(1);
    } else if (normalized.startsWith('8')) {
      normalized = '998' + normalized.substring(1);
    } else if (normalized.length === 9 && !normalized.startsWith('998')) {
      normalized = '998' + normalized;
    } else if (!normalized.startsWith('998')) {
      return null;
    }

    if (normalized.length !== 12 || !normalized.startsWith('998')) {
      return null;
    }

    return normalized;
  }
}
