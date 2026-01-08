import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentStrategy } from './payment-strategy.interface';
import * as crypto from 'crypto';
import { retry, CircuitBreaker } from '../../../common/utils/retry.util';

@Injectable()
export class ClickStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(ClickStrategy.name);
  private readonly merchantId: string;
  private readonly serviceId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly configService: ConfigService) {
    const paymentConfig = this.configService.get('payment');
    this.merchantId = paymentConfig?.click?.merchantId || '';
    this.serviceId = paymentConfig?.click?.serviceId || '';
    this.secretKey = paymentConfig?.click?.secretKey || '';
    this.baseUrl =
      paymentConfig?.click?.baseUrl || 'https://api.click.uz/v2/merchant';
    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
  }

  private generateSign(data: Record<string, unknown>): string {
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys
      .map((key) => {
        const value = data[key];
        const stringValue =
          value === null || value === undefined
            ? ''
            : typeof value === 'string'
              ? value
              : typeof value === 'number'
                ? value.toString()
                : JSON.stringify(value);
        return `${key}=${stringValue}`;
      })
      .join('&');
    return crypto
      .createHash('md5')
      .update(signString + this.secretKey)
      .digest('hex');
  }

  async initiatePayment(
    amount: number,
    orderId: string,
    transactionId: string,
  ): Promise<{
    transactionId: string;
    redirectUrl?: string;
    paymentUrl?: string;
    gatewayTransactionId?: string;
    gatewayOrderId?: string;
  }> {
    return this.circuitBreaker
      .execute(async () => {
        return retry(
          async () => {
            const amountInTiyin = Math.round(amount * 100);
            const timestamp = Date.now().toString();

            const data = {
              merchant_id: this.merchantId,
              service_id: this.serviceId,
              amount: amountInTiyin,
              transaction_param: orderId,
              merchant_trans_id: transactionId,
            };

            const sign = this.generateSign(data);
            const requestData = {
              ...data,
              sign_time: timestamp,
              sign_string: sign,
            };

            const response = await fetch(`${this.baseUrl}/invoice/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify(requestData),
            });

            if (!response.ok) {
              const error = await response.json();
              this.logger.error(
                `Click payment initiation failed: ${JSON.stringify(error)}`,
              );
              throw new Error(
                `Click payment initiation failed: ${error.error_note || 'Unknown error'}`,
              );
            }

            const result = await response.json();

            if (result.error_code !== 0) {
              this.logger.error(`Click error: ${JSON.stringify(result)}`);
              throw new Error(
                `Click error: ${result.error_note || 'Unknown error'}`,
              );
            }

            const paymentUrl = result.invoice_url;

            this.logger.log(
              `Click payment initiated: ${transactionId}, Gateway transaction: ${result.click_trans_id}`,
            );

            return {
              transactionId,
              paymentUrl,
              redirectUrl: paymentUrl,
              gatewayTransactionId: result.click_trans_id?.toString(),
              gatewayOrderId: orderId,
            };
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying Click payment initiation (attempt ${attempt}/3) for transaction: ${transactionId}`,
                error.message,
              );
            },
          },
        );
      })
      .catch((error) => {
        this.logger.error(
          `Error initiating Click payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error;
      });
  }

  async verifyPayment(
    gatewayTransactionId: string,
    transactionId: string,
  ): Promise<{
    success: boolean;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    gatewayTransactionId?: string;
  }> {
    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const data = {
              merchant_id: this.merchantId,
              service_id: this.serviceId,
              click_trans_id: gatewayTransactionId,
              merchant_trans_id: transactionId,
            };

            const sign = this.generateSign(data);
            const requestData = {
              ...data,
              sign_string: sign,
            };

            const response = await fetch(`${this.baseUrl}/payment/status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify(requestData),
            });

            if (!response.ok) {
              this.logger.warn(
                `Click verification failed for transaction ${transactionId}`,
              );
              return {
                success: false,
                status: 'FAILED',
                gatewayTransactionId,
              };
            }

            const result = await response.json();

            if (result.error_code !== 0) {
              this.logger.warn(
                `Click verification error for transaction ${transactionId}: ${JSON.stringify(result)}`,
              );
              return {
                success: false,
                status: 'FAILED',
                gatewayTransactionId,
              };
            }

            if (result.payment_status === 2) {
              return {
                success: true,
                status: 'COMPLETED',
                gatewayTransactionId,
              };
            }

            if (result.payment_status === -1 || result.payment_status === -99) {
              return {
                success: false,
                status: 'FAILED',
                gatewayTransactionId,
              };
            }

            return {
              success: false,
              status: 'PENDING',
              gatewayTransactionId,
            };
          },
          {
            maxAttempts: 2,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying Click verification (attempt ${attempt}/2) for transaction: ${transactionId}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(
        `Error verifying Click payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
        status: 'FAILED',
        gatewayTransactionId,
      };
    }
  }

  async refundPayment(
    gatewayTransactionId: string,
    amount: number,
    transactionId: string,
  ): Promise<{
    success: boolean;
    refundTransactionId?: string;
  }> {
    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const amountInTiyin = Math.round(amount * 100);
            const refundTransactionId = Date.now().toString();

            const data = {
              merchant_id: this.merchantId,
              service_id: this.serviceId,
              click_trans_id: gatewayTransactionId,
              merchant_trans_id: transactionId,
              amount: amountInTiyin,
              merchant_prepare_id: refundTransactionId,
            };

            const sign = this.generateSign(data);
            const requestData = {
              ...data,
              sign_string: sign,
            };

            const response = await fetch(`${this.baseUrl}/payment/reversal`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify(requestData),
            });

            if (!response.ok) {
              const error = await response.json();
              this.logger.error(
                `Click refund failed for transaction ${transactionId}: ${JSON.stringify(error)}`,
              );
              throw new Error(
                `Click refund failed: ${error.error_note || 'Unknown error'}`,
              );
            }

            const result = await response.json();

            if (result.error_code !== 0) {
              this.logger.error(
                `Click refund error: ${JSON.stringify(result)}`,
              );
              throw new Error(
                `Click refund error: ${result.error_note || 'Unknown error'}`,
              );
            }

            this.logger.log(
              `Click refund successful for transaction ${transactionId}`,
            );

            return {
              success: true,
              refundTransactionId,
            };
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying Click refund (attempt ${attempt}/3) for transaction: ${transactionId}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(
        `Error processing Click refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyWebhook(payload: unknown, _headers: Record<string, string>): boolean {
    try {
      const data = payload as {
        merchant_trans_id?: string;
        click_trans_id?: string;
        sign_string?: string;
      };

      if (!data.sign_string) {
        return false;
      }

      const signData: Record<string, unknown> = {
        click_trans_id: data.click_trans_id,
        service_id: this.serviceId,
        merchant_trans_id: data.merchant_trans_id,
      };

      const payloadData = payload as {
        amount?: number;
        action?: number;
        sign_time?: string;
      };

      if (payloadData.amount !== undefined) {
        signData.amount = payloadData.amount;
      }
      if (payloadData.action !== undefined) {
        signData.action = payloadData.action;
      }
      if (payloadData.sign_time !== undefined) {
        signData.sign_time = payloadData.sign_time;
      }

      const expectedSign = this.generateSign(signData);
      return expectedSign === data.sign_string;
    } catch (error) {
      this.logger.error(
        `Error verifying Click webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  processWebhook(payload: unknown): Promise<{
    transactionId: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    gatewayTransactionId?: string;
    amount?: number;
  }> {
    try {
      const data = payload as {
        click_trans_id?: string;
        merchant_trans_id?: string;
        amount?: number;
        action?: number;
        error?: number;
        error_note?: string;
      };

      const gatewayTransactionId = data.click_trans_id?.toString();
      const transactionId = data.merchant_trans_id;
      const amount = data.amount ? data.amount / 100 : undefined;
      const action = data.action;

      if (!gatewayTransactionId || !transactionId) {
        throw new Error('Missing required Click webhook parameters');
      }

      let status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (action === 0) {
        status = 'COMPLETED';
      } else if (action === -1 || data.error) {
        status = 'FAILED';
      }

      return Promise.resolve({
        transactionId,
        status,
        gatewayTransactionId,
        amount,
      });
    } catch (error) {
      this.logger.error(
        `Error processing Click webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
