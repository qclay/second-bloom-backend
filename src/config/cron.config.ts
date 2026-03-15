import { registerAs } from '@nestjs/config';

export const cronConfig = registerAs('cron', () => ({
  enabled:
    process.env.CRON_ENABLED === 'true' ||
    process.env.NODE_ENV === 'production',

  jobs: {
    auctions: {
      enabled: process.env.CRON_AUCTIONS_ENABLED !== 'false',
      expression: process.env.CRON_AUCTIONS_EXPRESSION || '*/30 * * * * *',
      batchSize: parseInt(process.env.CRON_AUCTIONS_BATCH_SIZE || '100', 10),
    },
    otps: {
      enabled: process.env.CRON_OTPS_ENABLED !== 'false',
      expression: process.env.CRON_OTPS_EXPRESSION || '0 * * * *',
      batchSize: parseInt(process.env.CRON_OTPS_BATCH_SIZE || '500', 10),
    },
    payments: {
      enabled: process.env.CRON_PAYMENTS_ENABLED !== 'false',
      expression: process.env.CRON_PAYMENTS_EXPRESSION || '0 * * * *',
      batchSize: parseInt(process.env.CRON_PAYMENTS_BATCH_SIZE || '500', 10),
      maxAgeMs: parseInt(process.env.CRON_PAYMENTS_MAX_AGE_MS || '3600000', 10),
    },
    conversations: {
      enabled: process.env.CRON_CONVERSATIONS_ENABLED !== 'false',
      expression: process.env.CRON_CONVERSATIONS_EXPRESSION || '*/30 * * * *',
      batchSize: parseInt(
        process.env.CRON_CONVERSATIONS_BATCH_SIZE || '500',
        10,
      ),
    },
  },
}));
