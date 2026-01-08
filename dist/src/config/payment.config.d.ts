export declare const paymentConfig: (() => {
    payme: {
        merchantId: string | undefined;
        secretKey: string | undefined;
        baseUrl: string;
    };
    click: {
        merchantId: string | undefined;
        serviceId: string | undefined;
        secretKey: string | undefined;
        baseUrl: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    payme: {
        merchantId: string | undefined;
        secretKey: string | undefined;
        baseUrl: string;
    };
    click: {
        merchantId: string | undefined;
        serviceId: string | undefined;
        secretKey: string | undefined;
        baseUrl: string;
    };
}>;
