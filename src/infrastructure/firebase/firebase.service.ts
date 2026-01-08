import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { IFirebaseService } from './firebase-service.interface';
import { retry, CircuitBreaker } from '../../common/utils/retry.util';

@Injectable()
export class FirebaseService implements IFirebaseService, OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | null = null;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly configService: ConfigService) {
    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
  }

  onModuleInit() {
    try {
      const firebaseConfig = this.configService.get('firebase');
      const projectId = firebaseConfig?.projectId;
      const privateKey = firebaseConfig?.privateKey;
      const clientEmail = firebaseConfig?.clientEmail;

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn(
          'Firebase credentials not configured. Push notifications will be disabled.',
        );
        return;
      }

      if (admin.apps.length === 0) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.app = admin.app();
      }
    } catch (error) {
      this.logger.error(
        'Failed to initialize Firebase Admin SDK',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized. Notification not sent.');
      return false;
    }

    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const message: admin.messaging.Message = {
              token,
              notification: {
                title,
                body,
              },
              data: data
                ? Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [
                      key,
                      String(value),
                    ]),
                  )
                : undefined,
              android: {
                priority: 'high' as const,
              },
              apns: {
                payload: {
                  aps: {
                    sound: 'default',
                    badge: 1,
                  },
                },
              },
            };

            const response = await admin.messaging().send(message);
            this.logger.log(`FCM notification sent successfully: ${response}`);
            return true;
          },
          {
            maxAttempts: 2,
            delay: 500,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying FCM notification send (attempt ${attempt}/2)`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to send FCM notification to token ${token.substring(0, 10)}...`,
        error instanceof Error ? error.message : 'Unknown error',
      );

      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code?: string };
        if (
          firebaseError.code === 'messaging/invalid-registration-token' ||
          firebaseError.code === 'messaging/registration-token-not-registered'
        ) {
          this.logger.warn(
            `Invalid or unregistered FCM token: ${token.substring(0, 10)}...`,
          );
          const invalidTokenError = new Error('INVALID_TOKEN');
          invalidTokenError.name = 'InvalidTokenError';
          throw invalidTokenError;
        }
      }

      if (error instanceof Error && error.name === 'InvalidTokenError') {
        throw error;
      }

      return false;
    }
  }

  async sendNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failure: number }> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized. Notifications not sent.');
      return { success: 0, failure: tokens.length };
    }

    if (tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data
          ? Object.fromEntries(
              Object.entries(data).map(([key, value]) => [key, String(value)]),
            )
          : undefined,
        android: {
          priority: 'high' as const,
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `FCM multicast sent: ${response.successCount} success, ${response.failureCount} failure`,
      );

      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokens[idx]);
            }
            this.logger.warn(
              `Failed to send to token ${tokens[idx].substring(0, 10)}...: ${resp.error?.message}`,
            );
          }
        });

        if (invalidTokens.length > 0) {
          this.logger.warn(
            `Found ${invalidTokens.length} invalid FCM tokens in multicast. They should be removed from database.`,
          );
        }
      }

      return {
        success: response.successCount,
        failure: response.failureCount,
      };
    } catch (error) {
      this.logger.error(
        'Failed to send FCM multicast notification',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return { success: 0, failure: tokens.length };
    }
  }

  validateToken(token: string): boolean {
    if (!this.app) {
      return false;
    }

    if (!token || typeof token !== 'string') {
      return false;
    }

    const trimmedToken = token.trim();
    if (trimmedToken.length < 10 || trimmedToken.length > 2000) {
      return false;
    }

    return true;
  }
}
