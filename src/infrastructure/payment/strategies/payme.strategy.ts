import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentStrategy } from './payment-strategy.interface';
import { retry, CircuitBreaker } from '../../../common/utils/retry.util';

@Injectable()
export class PaymeStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(PaymeStrategy.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly configService: ConfigService) {
    const paymentConfig = this.configService.get('payment');
    this.merchantId = paymentConfig?.payme?.merchantId || '';
    this.secretKey = paymentConfig?.payme?.secretKey || '';
    this.baseUrl =
      paymentConfig?.payme?.baseUrl || 'https://checkout.paycom.uz/api';
    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
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

            const data = {
              method: 'cards.create',
              params: {
                card: {
                  number: '',
                  expire: '',
                },
                amount: amountInTiyin,
                account: {
                  order_id: orderId,
                },
              },
            };

            const response = await fetch(`${this.baseUrl}/cards.create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth': `${this.merchantId}:${this.secretKey}`,
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const error = await response.json();
              this.logger.error(
                `Payme payment initiation failed: ${JSON.stringify(error)}`,
              );
              throw new Error(
                `Payme payment initiation failed: ${error.message || 'Unknown error'}`,
              );
            }

            const result = await response.json();

            if (result.error) {
              this.logger.error(`Payme error: ${JSON.stringify(result.error)}`);
              throw new Error(
                `Payme error: ${result.error.message || 'Unknown error'}`,
              );
            }

            const paymentUrl = result.result?.card?.token
              ? `${this.baseUrl}/cards.verify?token=${result.result.card.token}`
              : undefined;

            this.logger.log(
              `Payme payment initiated: ${transactionId}, Gateway transaction: ${result.result?.card?.token}`,
            );

            return {
              transactionId,
              paymentUrl,
              gatewayTransactionId: result.result?.card?.token,
              gatewayOrderId: orderId,
            };
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying Payme payment initiation (attempt ${attempt}/3) for transaction: ${transactionId}`,
                error.message,
              );
            },
          },
        );
      })
      .catch((error) => {
        this.logger.error(
          `Error initiating Payme payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
              method: 'cards.get_verify_code',
              params: {
                token: gatewayTransactionId,
              },
            };

            const response = await fetch(
              `${this.baseUrl}/cards.get_verify_code`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Auth': `${this.merchantId}:${this.secretKey}`,
                },
                body: JSON.stringify(data),
              },
            );

            if (!response.ok) {
              this.logger.warn(
                `Payme verification failed for transaction ${transactionId}`,
              );
              return {
                success: false,
                status: 'FAILED',
                gatewayTransactionId,
              };
            }

            const result = await response.json();

            if (result.error) {
              this.logger.warn(
                `Payme verification error for transaction ${transactionId}: ${JSON.stringify(result.error)}`,
              );
              return {
                success: false,
                status: 'FAILED',
                gatewayTransactionId,
              };
            }

            const receiptData = {
              method: 'receipts.get',
              params: {
                id: gatewayTransactionId,
              },
            };

            const receiptResponse = await fetch(
              `${this.baseUrl}/receipts.get`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Auth': `${this.merchantId}:${this.secretKey}`,
                },
                body: JSON.stringify(receiptData),
              },
            );

            if (!receiptResponse.ok) {
              return {
                success: false,
                status: 'PENDING',
                gatewayTransactionId,
              };
            }

            const receiptResult = await receiptResponse.json();

            if (receiptResult.result?.state === 2) {
              return {
                success: true,
                status: 'COMPLETED',
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
                `Retrying Payme verification (attempt ${attempt}/2) for transaction: ${transactionId}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(
        `Error verifying Payme payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

            const data = {
              method: 'cards.cancel',
              params: {
                id: gatewayTransactionId,
                amount: amountInTiyin,
              },
            };

            const response = await fetch(`${this.baseUrl}/cards.cancel`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth': `${this.merchantId}:${this.secretKey}`,
              },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              const error = await response.json();
              this.logger.error(
                `Payme refund failed for transaction ${transactionId}: ${JSON.stringify(error)}`,
              );
              throw new Error(
                `Payme refund failed: ${error.message || 'Unknown error'}`,
              );
            }

            const result = await response.json();

            if (result.error) {
              this.logger.error(
                `Payme refund error: ${JSON.stringify(result.error)}`,
              );
              throw new Error(
                `Payme refund error: ${result.error.message || 'Unknown error'}`,
              );
            }

            this.logger.log(
              `Payme refund successful for transaction ${transactionId}`,
            );

            return {
              success: true,
              refundTransactionId: result.result?.cancel_time?.toString(),
            };
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying Payme refund (attempt ${attempt}/3) for transaction: ${transactionId}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(
        `Error processing Payme refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
      };
    }
  }

  verifyWebhook(payload: unknown, headers: Record<string, string>): boolean {
    try {
      const authHeader = headers['x-auth'] || headers['X-Auth'];
      if (!authHeader) {
        return false;
      }

      const [merchantId] = authHeader.split(':');
      return merchantId === this.merchantId;
    } catch (error) {
      this.logger.error(
        `Error verifying Payme webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  processWebhook(payload: unknown): Promise<{
    transactionId?: string;
    orderId?: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    gatewayTransactionId?: string;
    amount?: number;
  }> {
    try {
      const data = payload as {
        method?: string;
        params?: {
          id?: string;
          account?: {
            order_id?: string;
          };
          amount?: number;
          state?: number;
        };
      };

      if (data.method !== 'receipts.pay' && data.method !== 'receipts.cancel') {
        throw new Error(`Unknown Payme method: ${data.method}`);
      }

      const gatewayTransactionId = data.params?.id;
      const orderId = data.params?.account?.order_id;
      const amount = data.params?.amount ? data.params.amount / 100 : undefined;
      const state = data.params?.state;

      if (!gatewayTransactionId || !orderId) {
        throw new Error('Missing required Payme webhook parameters');
      }

      let status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (data.method === 'receipts.pay' && state === 2) {
        status = 'COMPLETED';
      } else if (data.method === 'receipts.cancel' || state === -1) {
        status = 'FAILED';
      }

      return Promise.resolve({
        orderId,
        status,
        gatewayTransactionId,
        amount,
      });
    } catch (error) {
      this.logger.error(
        `Error processing Payme webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
