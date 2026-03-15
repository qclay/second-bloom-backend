import type { TranslationRecord } from './translation.util';

export const NOTIFICATION_MESSAGES: Record<
  string,
  { title: TranslationRecord; message: TranslationRecord }
> = {
  OUTBID: {
    title: {
      en: 'You have been outbid',
      ru: 'Вашу ставку перебили',
      uz: 'Sizning stavkangiz oshirildi',
    },
    message: {
      en: 'Your bid was outbid in the auction for "{{product}}". Current bid: {{amountText}}',
      ru: 'В аукционе по букету "{{product}}" вашу ставку перебили. Текущая ставка: {{amountText}}',
      uz: '"{{product}}" buketi bo‘yicha auksionda stavkangiz oshirildi. Joriy stavka: {{amountText}}',
    },
  },
  NEW_BID_SELLER: {
    title: {
      en: 'New bid on your bouquet',
      ru: 'Новая ставка на ваш букет',
      uz: 'Yangi stavka',
    },
    message: {
      en: 'Your bouquet "{{product}}" received a new bid: {{amountText}}',
      ru: 'На ваш букет "{{product}}" сделана новая ставка: {{amountText}}',
      uz: 'Sizning "{{product}}" buketingizga yangi stavka qo‘yildi: {{amountText}}',
    },
  },
  AUCTION_ENDED_WINNER: {
    title: {
      en: 'Auction ended',
      ru: 'Аукцион завершён',
      uz: 'Auksion yakunlandi',
    },
    message: {
      en: 'You won the auction for "{{product}}".',
      ru: 'Вы выиграли аукцион по букету "{{product}}".',
      uz: '"{{product}}" buketi bo‘yicha auksionda g‘olib bo‘ldingiz.',
    },
  },
  AUCTION_ENDED: {
    title: {
      en: 'Auction ended',
      ru: 'Аукцион завершён',
      uz: 'Auksion yakunlandi',
    },
    message: {
      en: 'The auction for "{{product}}" has ended.',
      ru: 'Аукцион по букету "{{product}}" завершён.',
      uz: '"{{product}}" buketi bo‘yicha auksion yakunlandi.',
    },
  },
  AUCTION_EXTENDED: {
    title: {
      en: 'Auction extended',
      ru: 'Аукцион продлён',
      uz: 'Auksion uzaytildi',
    },
    message: {
      en: 'Auction extended until {{formattedTime}}',
      ru: 'Аукцион продлён до {{formattedTime}}',
      uz: 'Auksion {{formattedTime}} ga qadar uzaytirildi.',
    },
  },
  BID_REJECTED: {
    title: {
      en: 'Your bid was rejected',
      ru: 'Ваша ставка отклонена',
      uz: 'Stavkangiz rad etildi',
    },
    message: {
      en: 'The auction owner rejected your bid{{amountSuffix}} for "{{product}}".',
      ru: 'Автор аукциона отклонил вашу ставку{{amountSuffix}} по букету "{{product}}".',
      uz: 'Auksion muallifi "{{product}}" buketi bo\'yicha{{amountSuffix}} stavkangizni rad etdi.',
    },
  },
  ORDER_CONFIRMED: {
    title: {
      en: 'Order confirmed',
      ru: 'Заказ подтверждён',
      uz: 'Buyurtma tasdiqlandi',
    },
    message: {
      en: 'Seller confirmed your order #{{orderNumber}} for "{{product}}".',
      ru: 'Продавец подтвердил ваш заказ №{{orderNumber}} по букету "{{product}}".',
      uz: 'Sotuvchi "{{product}}" buketi bo\'yicha #{{orderNumber}} buyurtmangizni tasdiqladi.',
    },
  },
  ORDER_SHIPPED: {
    title: {
      en: 'Order shipped',
      ru: 'Заказ отправлен',
      uz: 'Buyurtma yuborildi',
    },
    message: {
      en: 'Your order #{{orderNumber}} for "{{product}}" has been shipped.',
      ru: 'Ваш заказ №{{orderNumber}} по букету "{{product}}" отправлен.',
      uz: '"{{product}}" buketi bo\'yicha #{{orderNumber}} buyurtmangiz yuborildi.',
    },
  },
  ORDER_DELIVERED: {
    title: {
      en: 'Order delivered',
      ru: 'Заказ доставлен',
      uz: 'Buyurtma yetkazildi',
    },
    message: {
      en: 'Order #{{orderNumber}} for "{{product}}" has been delivered.',
      ru: 'Заказ №{{orderNumber}} по букету "{{product}}" доставлен.',
      uz: '"{{product}}" buketi bo\'yicha #{{orderNumber}} buyurtma yetkazildi.',
    },
  },
  NEW_MESSAGE: {
    title: {
      en: 'New message',
      ru: 'Новое сообщение',
      uz: 'Yangi xabar',
    },
    message: {
      en: '{{name}} sent you a new message.',
      ru: '{{name}} отправил вам новое сообщение.',
      uz: '{{name}} sizga yangi xabar yubordi.',
    },
  },
  DEFAULT: {
    title: {
      en: 'Notification',
      ru: 'Уведомление',
      uz: 'Bildirishnoma',
    },
    message: {
      en: 'You have a new notification.',
      ru: 'У вас новое уведомление.',
      uz: 'Sizda yangi bildirishnoma bor.',
    },
  },
};
