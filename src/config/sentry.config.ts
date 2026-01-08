import { registerAs } from '@nestjs/config';

export const sentryConfig = registerAs('sentry', () => ({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.SENTRY_ENABLED === 'true',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
}));
