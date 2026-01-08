import { ConfigService } from '@nestjs/config';
import { IAwsService } from './aws-service.interface';
export declare class AwsService implements IAwsService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    private readonly circuitBreaker;
    constructor(configService: ConfigService);
    uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
    deleteFile(key: string): Promise<boolean>;
    getFileUrl(key: string): string;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}
