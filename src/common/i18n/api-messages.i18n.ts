import type { TranslationRecord } from './translation.util';

export const API_MESSAGES: Record<string, TranslationRecord> = {
  'Insufficient publication credits. Please purchase credits to create a product.':
    {
      en: 'Insufficient publication credits. Please purchase credits to create a product.',
      ru: 'Недостаточно публикационных кредитов. Пожалуйста, пополните счёт для создания товара.',
      uz: 'Nashr kreditlari yetarli emas. Mahsulot yaratish uchun kredit sotib oling.',
    },
  'You cannot bid on your own auction': {
    en: 'You cannot bid on your own auction',
    ru: 'Вы не можете делать ставки на свой аукцион',
    uz: "O'zingizning auksioningizga taklif bera olmaysiz",
  },
  'You can no longer participate in this auction because your bids were rejected twice by the seller.':
    {
      en: 'You can no longer participate in this auction because your bids were rejected twice by the seller.',
      ru: 'Вы больше не можете участвовать в этом аукционе: продавец дважды отклонил ваши ставки.',
      uz: 'Siz endi bu auksionda qatnasha olmaysiz, chunki sotuvchi sizning takliflaringizni ikki marta rad etdi.',
    },
  'You cannot participate in this auction. The seller has restricted your access.':
    {
      en: 'You cannot participate in this auction. The seller has restricted your access.',
      ru: 'Вы не можете участвовать в этом аукционе. Продавец ограничил ваш доступ.',
      uz: 'Siz bu auksionda qatnasha olmaysiz. Sotuvchi sizning kirishingizni chekladi.',
    },
  'Only the auction owner can mark bids as read': {
    en: 'Only the auction owner can mark bids as read',
    ru: 'Только владелец аукциона может отмечать ставки как прочитанные',
    uz: "Faqat auksion egasi takliflarni o'qilgan deb belgilashi mumkin",
  },
  'Only the auction owner or admin can restore a rejected bid': {
    en: 'Only the auction owner or admin can restore a rejected bid',
    ru: 'Только владелец аукциона или администратор может восстановить отклонённую ставку',
    uz: 'Faqat auksion egasi yoki admin rad etilgan taklifni qayta tiklay oladi',
  },
  'Bid was not rejected by owner; nothing to restore': {
    en: 'Bid was not rejected by owner; nothing to restore',
    ru: 'Ставка не была отклонена владельцем; восстанавливать нечего',
    uz: "Taklif egasi tomonidan rad etilmagan; qaytarish uchun hech narsa yo'q",
  },
  'You do not have access to this conversation': {
    en: 'You do not have access to this conversation',
    ru: 'У вас нет доступа к этому чату',
    uz: 'Sizga bu suhbatga kirish ruxsat etilmagan',
  },
  'Conversation not found': {
    en: 'Conversation not found',
    ru: 'Чат не найден',
    uz: 'Suhbat topilmadi',
  },
  'Product not found': {
    en: 'Product not found',
    ru: 'Товар не найден',
    uz: 'Mahsulot topilmadi',
  },
  'Auction not found': {
    en: 'Auction not found',
    ru: 'Аукцион не найден',
    uz: 'Auksion topilmadi',
  },
  'Record not found': {
    en: 'Record not found',
    ru: 'Запись не найдена',
    uz: 'Yozuv topilmadi',
  },
  'Internal server error': {
    en: 'Internal server error',
    ru: 'Внутренняя ошибка сервера',
    uz: 'Server ichki xatosi',
  },
  'An internal server error occurred': {
    en: 'An internal server error occurred',
    ru: 'Произошла внутренняя ошибка сервера',
    uz: 'Server ichki xatosi yuz berdi',
  },
  'Validation failed': {
    en: 'Validation failed',
    ru: 'Ошибка проверки данных',
    uz: "Ma'lumotlarni tekshirish xatosi",
  },
  'Invalid reference: related record does not exist': {
    en: 'Invalid reference: related record does not exist',
    ru: 'Неверная ссылка: связанная запись не существует',
    uz: "Noto'g'ri havola: bog'liq yozuv mavjud emas",
  },
  'Required relation missing': {
    en: 'Required relation missing',
    ru: 'Отсутствует обязательная связь',
    uz: "Majburiy bog'lanish yo'q",
  },
  'Database validation error': {
    en: 'Database validation error',
    ru: 'Ошибка проверки данных в базе',
    uz: "Ma'lumotlar bazasida tekshirish xatosi",
  },
  'Database connection error': {
    en: 'Database connection error',
    ru: 'Ошибка подключения к базе данных',
    uz: "Ma'lumotlar bazasiga ulanish xatosi",
  },
  'Database operation failed': {
    en: 'Database operation failed',
    ru: 'Ошибка операции с базой данных',
    uz: "Ma'lumotlar bazasi operatsiyasi xatosi",
  },
  'Duplicate entry: {{target}} already exists': {
    en: 'Duplicate entry: {{target}} already exists',
    ru: 'Дубликат записи: {{target}} уже существует',
    uz: 'Bunday maʼlumot mavjud: {{target}} allaqachon bor',
  },
  AUCTION_WINNER_CHAT: {
    en: 'You won the auction. Please coordinate the next steps with the seller.',
    ru: 'Вы выиграли аукцион. Пожалуйста, согласуйте дальнейшие шаги с продавцом.',
    uz: 'Siz auksionda g‘olib bo‘ldingiz. Keyingi qadamlarni sotuvchiga yozib kelishing.',
  },
};
