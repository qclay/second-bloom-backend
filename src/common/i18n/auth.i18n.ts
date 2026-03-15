import type { TranslationRecord } from './translation.util';

export const AUTH_MESSAGES: Record<string, TranslationRecord> = {
  SMS_VERIFICATION_CODE: {
    en: 'Your Second Bloom verification code: {{code}}',
    ru: 'Ваш код подтверждения Second Bloom: {{code}}',
    uz: 'Second Bloom tasdiqlash kodi: {{code}}',
  },
  INVALID_OTP: {
    en: 'Invalid verification code',
    ru: 'Неверный код подтверждения',
    uz: 'Tasdiqlash kodi noto‘g‘ri',
  },
  OTP_EXPIRED: {
    en: 'Verification code has expired',
    ru: 'Код подтверждения истек',
    uz: 'Tasdiqlash kodi muddati o‘tgan',
  },
};
