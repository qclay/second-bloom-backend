import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IAwsService } from './aws-service.interface';
import { retry, CircuitBreaker } from '../../common/utils/retry.util';

@Injectable()
export class AwsService implements IAwsService {
  private readonly logger = new Logger(AwsService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>(
      'aws.secretAccessKey',
    );
    const region = this.configService.get<string>('aws.region', 'us-east-1');
    const endpoint = this.configService.get<string>('aws.s3Endpoint');
    this.bucketName = this.configService.get<string>('aws.s3Bucket') || '';

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.warn(
        'AWS credentials not configured. File uploads will fail.',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
      ...(endpoint && { endpoint }),
      forcePathStyle: !!endpoint,
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
                `Retrying S3 upload (attempt ${attempt}/3) for key: ${key}`,
                error.message,
              );
            },
          },
        );
      })
      .catch((error) => {
        this.logger.error(`Failed to upload file to S3: ${key}`, error);
        throw new Error(
          `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
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
                `Retrying S3 delete (attempt ${attempt}/3) for key: ${key}`,
                error.message,
              );
            },
          },
        );
      });
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${key}`, error);
      return false;
    }
  }

  getFileUrl(key: string): string {
    const region = this.configService.get<string>('aws.region', 'us-east-1');
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
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
