import { registerAs } from '@nestjs/config';

export const smsConfig = registerAs('sms', () => ({
  apiKey: process.env.SMS_API_KEY,
  apiUrl: process.env.SMS_API_URL,
  senderId: process.env.SMS_SENDER_ID,
  otpExpiresIn: parseInt(process.env.OTP_EXPIRES_IN || '300', 10), // Default 5 minutes
  otpLength: parseInt(process.env.OTP_LENGTH || '6', 10),
}));
