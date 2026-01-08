"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsConfig = void 0;
const config_1 = require("@nestjs/config");
exports.awsConfig = (0, config_1.registerAs)('aws', () => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
    s3Endpoint: process.env.AWS_S3_ENDPOINT,
}));
//# sourceMappingURL=aws.config.js.map