declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    REFRESH_TOKEN_SECRET?: string;
    REDIS_HOST?: string;
    REDIS_PORT?: number;
    REDIS_URL?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    AWS_S3_BUCKET?: string;
    AWS_S3_ENDPOINT?: string;
    SMS_API_KEY?: string;
    SMS_API_URL?: string;
    PAYME_MERCHANT_ID?: string;
    PAYME_SECRET_KEY?: string;
    CLICK_MERCHANT_ID?: string;
    CLICK_SERVICE_ID?: string;
    CLICK_SECRET_KEY?: string;
    PORT?: number;
    SENTRY_DSN?: string;
    SENTRY_ENABLED?: string;
    API_VERSION?: string;
    REDIS_PASSWORD?: string;
    CORS_ORIGIN?: string;
    SWAGGER_ENABLED?: string;
    SWAGGER_PATH?: string;
    SLOW_QUERY_THRESHOLD_MS?: number;
    FIREBASE_PROJECT_ID?: string;
    FIREBASE_PRIVATE_KEY?: string;
    FIREBASE_CLIENT_EMAIL?: string;
    FIREBASE_DATABASE_URL?: string;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
