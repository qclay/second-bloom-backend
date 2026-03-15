import type { TranslationRecord } from './translation.util';

export const TELEGRAM_MESSAGES: Record<string, TranslationRecord> = {
  REJECTION_REASON_TELEGRAM: {
    en: 'Rejected via Telegram bot (specify reason in admin panel if needed)',
    ru: 'Отклонено через бота Telegram (уточните причину в админке при необходимости)',
    uz: 'Telegram bot orqali rad etildi (kerak boʼlsa admin panelda sababini koʼrsating)',
  },
  STATUS_PUBLISHED: {
    en: '\n\n✅ PUBLISHED',
    ru: '\n\n✅ ОПУБЛИКОВАНО',
    uz: '\n\n✅ EʼLON QILINDI',
  },
  STATUS_REJECTED: {
    en: '\n\n❌ REJECTED \nReason: {{reason}}',
    ru: '\n\n❌ ОТКЛОНЕНО \nПричина: {{reason}}',
    uz: '\n\n❌ RAD ETILDI \nSabab: {{reason}}',
  },
  CALLBACK_PUBLISHED: {
    en: 'Product published',
    ru: 'Товар опубликован',
    uz: 'Mahsulot eʼlon qilindi',
  },
  CALLBACK_REJECTED: {
    en: 'Product rejected via Telegram',
    ru: 'Товар отклонён через Telegram',
    uz: 'Mahsulot Telegram orqali rad etildi',
  },
  MODERATION_ERROR: {
    en: 'Moderation error',
    ru: 'Ошибка модерации',
    uz: 'Moderatsiya xatosi',
  },
  REASON_NOT_SPECIFIED: {
    en: 'Not specified',
    ru: 'Не указана',
    uz: 'Koʼrsatilmagan',
  },
};
