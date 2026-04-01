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

  private isPlaceholder(value: string | undefined): boolean {
    if (!value) {
      return false;
    }

    const normalized = value.trim().toLowerCase();
    return (
      normalized.includes('your-firebase-') ||
      normalized.includes('your-firebase') ||
      normalized.includes('project-id')
    );
  }

  constructor(private readonly configService: ConfigService) {
    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
  }

  onModuleInit() {
    try {
      const firebaseConfig = this.configService.get('firebase');
      const projectId = firebaseConfig?.projectId as string | undefined;
      const privateKey = firebaseConfig?.privateKey as string | undefined;
      const clientEmail = firebaseConfig?.clientEmail as string | undefined;

      this.logger.log(
        `Firebase config presence: projectId=${Boolean(projectId)}, privateKey=${Boolean(privateKey)}, clientEmail=${Boolean(clientEmail)}`,
      );

      if (
        this.isPlaceholder(projectId) ||
        this.isPlaceholder(privateKey) ||
        this.isPlaceholder(clientEmail)
      ) {
        this.logger.warn(
          'Firebase credentials appear to use placeholder values from .env.example. Push notifications will fail until real credentials are provided.',
        );
      }

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn(
          'Firebase credentials not configured. Set FIREBASE_PROJECT_ID/FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL. Push notifications are disabled.',
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
    options?: { deliveryMode?: 'data-only' | 'notification' },
  ): Promise<boolean> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized. Notification not sent.');
      return false;
    }

    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const isDataOnly = options?.deliveryMode === 'data-only';
            const message: admin.messaging.Message = {
              token,
              ...(!isDataOnly && title && body
                ? { notification: { title, body } }
                : {}),
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
              apns: isDataOnly
                ? {
                    headers: {
                      'apns-push-type': 'background',
                      'apns-priority': '5',
                    },
                    payload: {
                      aps: {
                        contentAvailable: true,
                      },
                    },
                  }
                : {
                    headers: {
                      'apns-push-type': 'alert',
                      'apns-priority': '10',
                    },
                    payload: {
                      aps: {
                        sound: 'default',
                        badge: 1,
                      },
                    },
                  },
            };

            this.logger.log(
              `Sending FCM ${isDataOnly ? 'data-only' : 'notification'} message to token ${token.substring(0, 10)}... dataKeys=${data ? Object.keys(data).length : 0}`,
            );

            const response = await this.app!.messaging().send(message);
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
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code?: string; message?: string };
        this.logger.warn(
          `FCM single send failed with code=${firebaseError.code || 'unknown'}, message=${firebaseError.message || 'unknown'}`,
        );
      }

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
    options?: { deliveryMode?: 'data-only' | 'notification' },
  ): Promise<{ success: number; failure: number }> {
    if (!this.app) {
      this.logger.warn(
        'Firebase not initialized. Notifications not sent. Check FIREBASE_* env vars.',
      );
      return { success: 0, failure: tokens.length };
    }

    if (tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    try {
      const isDataOnly = options?.deliveryMode === 'data-only';
      const message: admin.messaging.MulticastMessage = {
        tokens,
        ...(!isDataOnly && title && body
          ? { notification: { title, body } }
          : {}),
        data: data
          ? Object.fromEntries(
              Object.entries(data).map(([key, value]) => [key, String(value)]),
            )
          : undefined,
        android: {
          priority: 'high' as const,
        },
        apns: isDataOnly
          ? {
              headers: {
                'apns-push-type': 'background',
                'apns-priority': '5',
              },
              payload: {
                aps: {
                  contentAvailable: true,
                },
              },
            }
          : {
              headers: {
                'apns-push-type': 'alert',
                'apns-priority': '10',
              },
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
      };

      this.logger.log(
        `Sending FCM ${isDataOnly ? 'data-only' : 'notification'} multicast to ${tokens.length} token(s), dataKeys=${data ? Object.keys(data).length : 0}`,
      );

      const response = await this.app.messaging().sendEachForMulticast(message);
      this.logger.log(
        `FCM multicast sent: ${response.successCount} success, ${response.failureCount} failure`,
      );

      if (response.failureCount > 0) {
        const failureCodeCounts: Record<string, number> = {};
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (errorCode) {
              failureCodeCounts[errorCode] =
                (failureCodeCounts[errorCode] || 0) + 1;
            }
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

        this.logger.warn(
          `FCM multicast failure breakdown: ${JSON.stringify(failureCodeCounts)}`,
        );

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
