"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentConfig = void 0;
const config_1 = require("@nestjs/config");
exports.paymentConfig = (0, config_1.registerAs)('payment', () => ({
    payme: {
        merchantId: process.env.PAYME_MERCHANT_ID,
        secretKey: process.env.PAYME_SECRET_KEY,
        baseUrl: process.env.PAYME_BASE_URL || 'https://checkout.paycom.uz/api',
    },
    click: {
        merchantId: process.env.CLICK_MERCHANT_ID,
        serviceId: process.env.CLICK_SERVICE_ID,
        secretKey: process.env.CLICK_SECRET_KEY,
        baseUrl: process.env.CLICK_BASE_URL || 'https://api.click.uz/v2/merchant',
    },
}));
//# sourceMappingURL=payment.config.js.map