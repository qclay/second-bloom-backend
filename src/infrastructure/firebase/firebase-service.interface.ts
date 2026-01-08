export const FIREBASE_SERVICE_TOKEN = Symbol('IFirebaseService');

export interface IFirebaseService {
  sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean>;
  sendNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failure: number }>;
  validateToken(token: string): boolean;
}
