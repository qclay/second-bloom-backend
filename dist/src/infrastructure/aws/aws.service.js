"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AwsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const retry_util_1 = require("../../common/utils/retry.util");
let AwsService = AwsService_1 = class AwsService {
    configService;
    logger = new common_1.Logger(AwsService_1.name);
    s3Client;
    bucketName;
    circuitBreaker;
    constructor(configService) {
        this.configService = configService;
        const accessKeyId = this.configService.get('aws.accessKeyId');
        const secretAccessKey = this.configService.get('aws.secretAccessKey');
        const region = this.configService.get('aws.region', 'us-east-1');
        const endpoint = this.configService.get('aws.s3Endpoint');
        this.bucketName = this.configService.get('aws.s3Bucket') || '';
        if (!accessKeyId || !secretAccessKey || !this.bucketName) {
            this.logger.warn('AWS credentials not configured. File uploads will fail.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region,
            credentials: accessKeyId && secretAccessKey
                ? {
                    accessKeyId,
                    secretAccessKey,
                }
                : undefined,
            ...(endpoint && { endpoint }),
            forcePathStyle: !!endpoint,
        });
        this.circuitBreaker = new retry_util_1.CircuitBreaker(5, 60000, this.logger);
    }
    async uploadFile(file, key, contentType) {
        return this.circuitBreaker
            .execute(async () => {
            return (0, retry_util_1.retry)(async () => {
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file,
                    ContentType: contentType,
                });
                await this.s3Client.send(command);
                const url = this.getFileUrl(key);
                return url;
            }, {
                maxAttempts: 3,
                delay: 1000,
                backoff: 'exponential',
                onRetry: (error, attempt) => {
                    this.logger.warn(`Retrying S3 upload (attempt ${attempt}/3) for key: ${key}`, error.message);
                },
            });
        })
            .catch((error) => {
            this.logger.error(`Failed to upload file to S3: ${key}`, error);
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
    }
    async deleteFile(key) {
        try {
            return await this.circuitBreaker.execute(async () => {
                return (0, retry_util_1.retry)(async () => {
                    const command = new client_s3_1.DeleteObjectCommand({
                        Bucket: this.bucketName,
                        Key: key,
                    });
                    await this.s3Client.send(command);
                    return true;
                }, {
                    maxAttempts: 3,
                    delay: 1000,
                    backoff: 'exponential',
                    onRetry: (error, attempt) => {
                        this.logger.warn(`Retrying S3 delete (attempt ${attempt}/3) for key: ${key}`, error.message);
                    },
                });
            });
        }
        catch (error) {
            this.logger.error(`Failed to delete file from S3: ${key}`, error);
            return false;
        }
    }
    getFileUrl(key) {
        const region = this.configService.get('aws.region', 'us-east-1');
        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    }
    async getSignedUrl(key, expiresIn = 3600) {
        return this.circuitBreaker
            .execute(async () => {
            return (0, retry_util_1.retry)(async () => {
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            }, {
                maxAttempts: 3,
                delay: 500,
                backoff: 'exponential',
                onRetry: (error, attempt) => {
                    this.logger.warn(`Retrying signed URL generation (attempt ${attempt}/3) for key: ${key}`, error.message);
                },
            });
        })
            .catch((error) => {
            this.logger.error(`Failed to generate signed URL for: ${key}`, error);
            throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
    }
};
exports.AwsService = AwsService;
exports.AwsService = AwsService = AwsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AwsService);
//# sourceMappingURL=aws.service.js.map