import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  accessKeyId: process.env.SPACES_ACCESS_KEY,
  secretAccessKey: process.env.SPACES_SECRET_KEY,
  region: process.env.SPACES_REGION || 'nyc3',
  bucket: process.env.SPACES_BUCKET,
  endpoint: process.env.SPACES_ENDPOINT,
}));
