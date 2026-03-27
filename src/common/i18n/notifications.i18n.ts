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
      en: 'Order processing',
      ru: 'Заказ в обработке',
      uz: 'Buyurtma qayta ishlanmoqda',
    },
    message: {
      en: 'Your order #{{orderNumber}} for "{{product}}" is now processing.',
      ru: 'Ваш заказ №{{orderNumber}} по букету "{{product}}" перешёл в обработку.',
      uz: '"{{product}}" buketi bo\'yicha #{{orderNumber}} buyurtmangiz qayta ishlash bosqichiga o\'tdi.',
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
      en: 'Order delivery completed',
      ru: 'Доставка заказа завершена',
      uz: 'Buyurtma yetkazib berildi',
    },
    message: {
      en: 'Delivery for order #{{orderNumber}} ("{{product}}") is completed.',
      ru: 'Доставка заказа №{{orderNumber}} по букету "{{product}}" завершена.',
      uz: '"{{product}}" buketi bo\'yicha #{{orderNumber}} buyurtma yetkazib berildi.',
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
  ORDER_CANCELLED: {
    title: {
      en: 'Order cancelled',
      ru: 'Заказ отменен',
      uz: 'Buyurtma bekor qilindi',
    },
    message: {
      en: 'Order #{{orderNumber}} ("{{product}}") has been cancelled.',
      ru: 'Заказ №{{orderNumber}} по букету "{{product}}" был отменен.',
      uz: '"{{product}}" buketi bo\'yicha #{{orderNumber}} buyurtma bekor qilindi.',
    },
  },
  PRODUCT_APPROVED: {
    title: {
      en: 'Product approved',
      ru: 'Товар одобрен',
      uz: 'Mahsulot tasdiqlandi',
    },
    message: {
      en: 'Your product "{{product}}" has passed moderation and is now published.',
      ru: 'Ваш товар "{{product}}" прошел модерацию и опубликован.',
      uz: '"{{product}}" mahsulotingiz moderatsiyadan o\'tdi va e\'lon qilindi.',
    },
  },
  PRODUCT_REJECTED: {
    title: {
      en: 'Product rejected',
      ru: 'Товар отклонен',
      uz: 'Mahsulot rad etildi',
    },
    message: {
      en: 'Your product "{{product}}" did not pass moderation. Reason: {{reason}}',
      ru: 'Ваш товар "{{product}}" не прошел модерацию. Причина: {{reason}}',
      uz: '"{{product}}" mahsulotingiz moderatsiyadan o\'tmadi. Sabab: {{reason}}',
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
