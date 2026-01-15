import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from './storage-service.interface';
import { retry, CircuitBreaker } from '../../common/utils/retry.util';

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly publicUrl?: string;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly accessKeyId?: string;
  private readonly secretAccessKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.accessKeyId = this.configService.get<string>('storage.accessKeyId');
    this.secretAccessKey = this.configService.get<string>(
      'storage.secretAccessKey',
    );
    this.region = this.configService.get<string>('storage.region', 'nyc3');
    this.endpoint = this.configService.get<string>('storage.endpoint');
    this.bucketName = this.configService.get<string>('storage.bucket') || '';

    if (!this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      const missing = [];
      if (!this.accessKeyId) missing.push('SPACES_ACCESS_KEY');
      if (!this.secretAccessKey) missing.push('SPACES_SECRET_KEY');
      if (!this.bucketName) missing.push('SPACES_BUCKET');
      this.logger.error(
        `Storage credentials not configured. Missing: ${missing.join(', ')}. File uploads will fail.`,
      );
    }

    this.s3Client = new S3Client({
      region: this.region || 'nyc3',
      credentials:
        this.accessKeyId && this.secretAccessKey
          ? {
              accessKeyId: this.accessKeyId,
              secretAccessKey: this.secretAccessKey,
            }
          : undefined,
      ...(this.endpoint && { endpoint: this.endpoint }),
      forcePathStyle: false,
    });

    this.circuitBreaker = new CircuitBreaker(5, 60000, this.logger);
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    return this.circuitBreaker
      .execute(async () => {
        return retry(
          async () => {
            const command = new PutObjectCommand({
              Bucket: this.bucketName,
              Key: key,
              Body: file,
              ContentType: contentType,
              ACL: 'public-read',
            });

            await this.s3Client.send(command);

            const url = this.getFileUrl(key);
            return url;
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying storage upload (attempt ${attempt}/3) for key: ${key}`,
                error.message,
              );
            },
          },
        );
      })
      .catch((error) => {
        const errorDetails: {
          message: string;
          code: number;
          resource: string;
          bucket: string;
          endpoint: string;
        } = {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: error?.Code || error?.$metadata?.httpStatusCode,
          resource: error?.Resource,
          bucket: this.bucketName,
          endpoint: this.endpoint || '',
        };

        this.logger.error(
          `Failed to upload file to storage: ${key}`,
          JSON.stringify(errorDetails, null, 2),
        );
        throw error;
      });
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      return await this.circuitBreaker.execute(async () => {
        return retry(
          async () => {
            const command = new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: key,
            });

            await this.s3Client.send(command);
            return true;
          },
          {
            maxAttempts: 3,
            delay: 1000,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying storage delete (attempt ${attempt}/3) for key: ${key}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(`Failed to delete file from storage: ${key}`, error);
      return false;
    }
  }

  getFileUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }

    if (this.endpoint) {
      const endpointUrl = new URL(this.endpoint);
      return `https://${this.bucketName}.${endpointUrl.hostname}/${key}`;
    }

    // Default to AWS S3 URL format
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return this.circuitBreaker
      .execute(async () => {
        return retry(
          async () => {
            const command = new GetObjectCommand({
              Bucket: this.bucketName,
              Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
          },
          {
            maxAttempts: 3,
            delay: 500,
            backoff: 'exponential',
            onRetry: (error, attempt) => {
              this.logger.warn(
                `Retrying signed URL generation (attempt ${attempt}/3) for key: ${key}`,
                error.message,
              );
            },
          },
        );
      })
      .catch((error) => {
        this.logger.error(`Failed to generate signed URL for: ${key}`, error);
        throw new Error(
          `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      });
  }
}
