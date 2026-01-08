"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentryConfig = void 0;
const config_1 = require("@nestjs/config");
exports.sentryConfig = (0, config_1.registerAs)('sentry', () => ({
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    enabled: process.env.SENTRY_ENABLED === 'true',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
}));
//# sourceMappingURL=sentry.config.js.map