import { registerAs } from '@nestjs/config';

export const paymentConfig = registerAs('payment', () => ({
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
