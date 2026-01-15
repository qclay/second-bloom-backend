import * as crypto from 'crypto';

type SortableValue =
  | string
  | number
  | boolean
  | null
  | SortableObject
  | SortableArray;
type SortableObject = { [key: string]: SortableValue };
type SortableArray = SortableValue[];

export class SignatureVerifier {
  private static sortObjectKeys(obj: SortableValue): SortableValue {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortObjectKeys(item)) as SortableArray;
    }

    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
        return sorted;
      }, {} as SortableObject);
  }

  static verifyWebhook(
    receivedSignature: string,
    payloadData: Record<string, unknown>,
    secretKey: string,
  ): boolean {
    try {
      const payloadStr = JSON.stringify(
        this.sortObjectKeys(payloadData as SortableValue),
      );

      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payloadStr)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(receivedSignature, 'utf8'),
      );
    } catch {
      return false;
    }
  }
}
