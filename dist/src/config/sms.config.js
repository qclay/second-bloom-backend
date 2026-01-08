"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsConfig = void 0;
const config_1 = require("@nestjs/config");
exports.smsConfig = (0, config_1.registerAs)('sms', () => ({
    apiKey: process.env.SMS_API_KEY,
    apiUrl: process.env.SMS_API_URL,
    senderId: process.env.SMS_SENDER_ID,
    otpExpiresIn: parseInt(process.env.OTP_EXPIRES_IN || '300', 10),
    otpLength: parseInt(process.env.OTP_LENGTH || '6', 10),
}));
//# sourceMappingURL=sms.config.js.map