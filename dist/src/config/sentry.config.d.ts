export declare const sentryConfig: (() => {
    dsn: string;
    environment: string;
    enabled: boolean;
    tracesSampleRate: number;
    profilesSampleRate: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    dsn: string;
    environment: string;
    enabled: boolean;
    tracesSampleRate: number;
    profilesSampleRate: number;
}>;
