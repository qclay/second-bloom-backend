import { registerAs } from '@nestjs/config';

export const smsConfig = registerAs('sms', () => ({
  email: process.env.ESKIZ_EMAIL,
  password: process.env.ESKIZ_PASSWORD,
  apiUrl: process.env.ESKIZ_API_URL || 'https://notify.eskiz.uz/api',
  senderId: process.env.ESKIZ_SENDER_ID || '4546',
  otpExpiresIn: parseInt(process.env.OTP_EXPIRES_IN || '300', 10),
  otpLength: parseInt(process.env.OTP_LENGTH || '6', 10),
}));
