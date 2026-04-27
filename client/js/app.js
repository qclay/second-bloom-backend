(function () {
  'use strict';

  const API_BASE = 'http://localhost:3000';
  const API_PREFIX = '/api/v1';

  const TRANSLATIONS = {
    en: {
      login_title: 'Second Bloom',
      login_subtitle: 'Sign in to test the platform',
      country_code: 'Country code',
      phone_number: 'Phone number',
      send_otp: 'Send OTP',
      code_sent_to: 'Code sent to',
      verify_code_label: 'Verification code (6 digits)',
      verify_signin: 'Verify & Sign In',
      change_number: 'Change number',
      signed_in_as: 'Signed in as',
      logout: 'Logout',
      tab_products: 'Products',
      tab_auctions: 'Auctions',
      tab_orders: 'Orders',
      tab_chat: 'Chat',
      tab_notifications: 'Notifications',
      search_products: 'Search products...',
      create_product: '+ Create Product',
      no_products: 'No products found. Create one to get started!',
      empty_oh: 'Oh, empty...',
      empty_add_nothing: 'It seems you haven\'t added anything yet. But it\'s never too late to start!',
      add_bouquet: 'Add bouquet',
      product_title: 'Title',
      product_description: 'Description',
      product_price: 'Price',
      product_currency: 'Currency',
      product_category: 'Category',
      product_condition: 'Condition',
      product_size: 'Size',
      product_tags: 'Tags (comma-separated)',
      product_region: 'Region',
      product_city: 'City',
      product_district: 'District',
      product_images: 'Product images',
      product_images_hint: 'Upload up to 10 images. They will be attached to the product.',
      product_create_auction: 'Create with auction',
      auction_start_price: 'Start price',
      auction_duration: 'Duration (hours)',
      auction_auto_extend: 'Auto-extend on late bids',
      save: 'Save',
      cancel: 'Cancel',
      back: '\u2190 Back',
      delete: 'Delete',
      edit: 'Edit',
      refresh: 'Refresh',
      loading: 'Loading...',
      no_auctions: 'No auctions found.',
      no_orders: 'No orders found.',
      order_number: 'Order #',
      order_create_and_chat: 'Create order & open chat',
      order_status: 'Status',
      order_amount: 'Amount',
      order_buyer: 'Buyer',
      order_seller: 'Seller',
      order_update_status: 'Change status',
      order_reject: 'Reject order',
      order_customer_details: 'Customer details',
      order_status_pending: 'Processing',
      order_status_confirmed: 'Processing',
      order_status_processing: 'Processing',
      order_status_shipped: 'In delivery',
      order_status_delivered: 'Delivery',
      order_status_delivery: 'Delivery',
      order_status_cancelled: 'Cancelled',
      buy_product: 'Buy product',
      all: 'All',
      active: 'Active',
      ended: 'Ended',
      current_price: 'Current Price',
      start_price: 'Start Price',
      time_left: 'Time Left',
      place_bid: 'Place Bid',
      bid_amount: 'Enter bid amount...',
      my_bids: 'My Bids',
      leaderboard: 'Leaderboard',
      bids: 'Bids',
      participants: 'Participants',
      total_bids: 'Total Bids',
      bid_placed: 'Bid placed successfully!',
      no_bids: 'No bids yet. Be the first!',
      conversations: 'Conversations',
      new_chat: 'New Chat',
      start_chat_with_user: 'Start a chat with a user',
      search_by_name: 'Search by name or phone...',
      search_messages: 'Search messages...',
      search_no_results: 'No messages found.',
      first_message_optional: 'First message (optional)',
      type_message: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      no_conversations: 'No conversations yet. Start a new chat!',
      select_conversation: 'Select a conversation or start a new chat.',
      someone_typing: 'Someone is typing...',
      chat_role_seller: 'Seller',
      chat_role_consumer: 'Consumer',
      order_chat_label: 'Order',
      open_chat: 'Open chat',
      open_auction: 'Open auction',
      cancel_winner: 'Cancel winner',
      cancel_winner_confirm: 'Cancel the auction winner and linked order?',
      winner_cancelled: 'Winner cancelled',
      tab_notifications_title: 'Notifications',
      mark_all_read: 'Mark all read',
      unread: 'Unread',
      no_notifications: 'No notifications yet.',
      tab_moderation: 'Moderation',
      moderation_hint: 'Review products pending approval. Approve to publish or reject with a reason (the seller will see it in chat).',
      moderation_empty: 'No products pending moderation',
      reject_reason_title: 'Rejection reason',
      reject_reason_hint: 'This message will be sent to the seller. Required.',
      reject_reason_placeholder: 'e.g. Photo quality is too low, please upload clearer images.',
      reject_submit: 'Reject product',
      approve_product: 'Approve',
      reject_product: 'Reject',
      view_product: 'View',
      filter_status_all: 'All',
      filter_status_posted: 'Posted',
      filter_status_pending: 'Pending',
      filter_status_rejected: 'Rejected',
      views: 'views',
      auction_ended: 'Auction Ended',
      auction_active: 'Auction Active',
      sale_status_available: 'Available',
      sale_status_on_auction: 'On auction',
      sale_status_awaiting_delivery: 'Awaiting delivery',
      sale_status_sold: 'Sold',
      tab_my_products: 'My products',
      sale_phase_all: 'All',
      sale_phase_in_auction: 'In auction',
      sale_phase_in_delivery: 'In delivery',
      sale_phase_sold: 'Sold',
      top_bids: 'Top bids',
      my_bid: 'My bid',
      leading: 'Leading',
      min_bid_hint: 'Minimum {amount}',
      product_details: 'Product Details',
      auction_info: 'Auction Info',
      bid_increment: 'Bid Increment',
      min_bid: 'Min Bid',
      auto_extend: 'Auto Extend',
      yes: 'Yes',
      no: 'No',
      winner: 'Winner',
      created: 'Created',
      retract: 'Retract',
      remove_bid: 'Remove',
      bid_removed: 'Bid removed by auction owner',
      bid_retracted: 'Bid retracted',
      rejected: 'Rejected',
      winning: 'Winning',
      live: 'LIVE',
      bids_all: 'All',
      bids_new: 'New',
      bids_top: 'Top',
      bids_rejected: 'Rejected',
      product_created: 'Product created successfully!',
      product_created_pending_moderation: 'Product created. It is now pending moderation and will be visible after approval.',
      product_updated: 'Product updated successfully!',
      product_deleted: 'Product deleted.',
      product_status_active: 'Active',
      product_status_inactive: 'Inactive',
      product_status_pending_moderation: 'Pending moderation',
      edit_product: 'Edit Product',
      existing_images: 'Current images (kept on save)',
      error_occurred: 'An error occurred',
      confirm_delete: 'Are you sure you want to delete this?',
      fill_required_fields: 'Please fill required fields',
      enter_valid_bid: 'Enter a valid bid amount',
      failed_join_auction: 'Failed to join auction room',
      new_bid_by: 'New bid by {name}: {amount}',
      you_have_been_outbid: 'You have been outbid!',
      auction_updated_price: 'Auction updated: {amount}',
      auction_extended_to: 'Auction extended to {time}',
      socket_error: 'Socket error',
      new_message_from: 'New message from {name}: "{text}"',
      message_deleted: 'A message was deleted',
      message_edited: 'A message was edited',
      all_notifications_read: 'All notifications marked as read',
      someone: 'Someone',
      just_now: 'Just now',
      minutes_ago: '{n}m ago',
      hours_ago: '{n}h ago',
      days_ago: '{n}d ago',
      feature_not_available: 'This feature is not available.',
      rate_limit_exceeded: 'Too many requests. Please try again in a moment.',
      balance_title: 'Your balance',
      balance_publications: 'publications',
      balance_top_up: 'Top up',
      transactions_title: 'Transactions',
      transactions_empty: 'No transactions yet',
      transaction_top_up: 'Balance top-up',
      transaction_publication: '{n} publication(s)',
      payment_success: 'Payment completed successfully',
    },
    uz: {
      login_title: 'Second Bloom',
      login_subtitle: 'Platformani sinash uchun kiring',
      country_code: 'Mamlakat kodi',
      phone_number: 'Telefon raqam',
      send_otp: 'OTP yuborish',
      code_sent_to: 'Kod yuborildi',
      verify_code_label: 'Tasdiqlash kodi (6 raqam)',
      verify_signin: 'Tasdiqlash va kirish',
      change_number: 'Raqamni o\'zgartirish',
      signed_in_as: 'Sifatida kirgan',
      logout: 'Chiqish',
      tab_products: 'Mahsulotlar',
      tab_auctions: 'Auktsionlar',
      tab_chat: 'Chat',
      tab_notifications: 'Bildirishnomalar',
      search_products: 'Mahsulot qidirish...',
      create_product: '+ Mahsulot yaratish',
      no_products: 'Mahsulotlar topilmadi. Boshlash uchun yarating!',
      empty_oh: 'Oy, bo\'sh...',
      empty_add_nothing: 'Siz hali hech narsa qo\'shmagan ko\'rinasiz. Lekin boshlash uchun hech qachon kech emas!',
      add_bouquet: 'Buket qo\'shish',
      product_title: 'Sarlavha',
      product_description: 'Tavsif',
      product_price: 'Narx',
      product_currency: 'Valyuta',
      product_category: 'Kategoriya',
      product_condition: 'Holat',
      product_size: 'O\'lcham',
      product_tags: 'Teglar (vergul bilan)',
      product_region: 'Viloyat',
      product_city: 'Shahar',
      product_district: 'Tuman',
      product_images: 'Mahsulot rasmlari',
      product_images_hint: 'Maksimal 10 rasm yuklang. Ular mahsulotga biriktiriladi.',
      product_create_auction: 'Auktsion bilan yaratish',
      auction_start_price: 'Boshlang\'ich narx',
      auction_duration: 'Davomiylik (soat)',
      auction_auto_extend: 'Kechikkan taklifda avtomatik uzaytirish',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      back: '\u2190 Orqaga',
      delete: 'O\'chirish',
      edit: 'Tahrirlash',
      refresh: 'Yangilash',
      loading: 'Yuklanmoqda...',
      no_auctions: 'Auktsionlar topilmadi.',
      no_orders: 'Buyurtmalar topilmadi.',
      order_number: 'Buyurtma #',
      order_create_and_chat: 'Buyurtma yaratish va chat',
      order_status: 'Holat',
      order_amount: 'Summa',
      order_buyer: 'Xaridor',
      order_seller: 'Sotuvchi',
      order_update_status: 'Holatni o\'zgartirish',
      order_reject: 'Buyurtmani rad etish',
      order_customer_details: 'Mijoz ma\'lumotlari',
      order_status_pending: 'Qayta ishlanmoqda',
      order_status_confirmed: 'Qayta ishlanmoqda',
      order_status_processing: 'Qayta ishlanmoqda',
      order_status_shipped: 'Yetkazilmoqda',
      order_status_delivered: 'Yetkazib berish',
      order_status_delivery: 'Yetkazib berish',
      order_status_cancelled: 'Bekor qilindi',
      buy_product: 'Mahsulotni sotib olish',
      all: 'Hammasi',
      active: 'Faol',
      ended: 'Tugagan',
      current_price: 'Joriy narx',
      start_price: 'Boshlang\'ich narx',
      time_left: 'Qolgan vaqt',
      place_bid: 'Taklif berish',
      bid_amount: 'Taklif summasini kiriting...',
      my_bids: 'Mening takliflarim',
      leaderboard: 'Reytinglar',
      bids: 'Takliflar',
      participants: 'Ishtirokchilar',
      total_bids: 'Jami takliflar',
      bid_placed: 'Taklif muvaffaqiyatli berildi!',
      no_bids: 'Hali takliflar yo\'q. Birinchi bo\'ling!',
      conversations: 'Suhbatlar',
      new_chat: 'Yangi chat',
      start_chat_with_user: 'Foydalanuvchi bilan suhbat boshlash',
      search_by_name: 'Ism yoki telefon bo\'yicha qidiring...',
      search_messages: 'Xabarlarni qidirish...',
      search_no_results: 'Xabar topilmadi.',
      first_message_optional: 'Birinchi xabar (ixtiyoriy)',
      type_message: 'Xabar yozing...',
      send: 'Yuborish',
      online: 'Online',
      offline: 'Offline',
      no_conversations: 'Hali suhbatlar yo\'q. Yangi chat boshlang!',
      select_conversation: 'Suhbat tanlang yoki yangi chat boshlang.',
      someone_typing: 'Kimdir yozmoqda...',
      chat_role_seller: 'Sotuvchi',
      chat_role_consumer: 'Xaridor',
      order_chat_label: 'Buyurtma',
      open_chat: 'Chatni ochish',
      open_auction: 'Auktsionni ochish',
      cancel_winner: 'G\'olibni bekor qilish',
      cancel_winner_confirm: 'Auktsion g\'olibi va bog\'langan buyurtmani bekor qilinsinmi?',
      winner_cancelled: 'G\'olib bekor qilindi',
      mark_all_read: 'Hammasini o\'qilgan deb belgilash',
      unread: 'O\'qilmagan',
      no_notifications: 'Hali bildirishnomalar yo\'q.',
      views: 'ko\'rishlar',
      auction_ended: 'Auktsion tugadi',
      auction_active: 'Auktsion faol',
      sale_status_available: 'Mavjud',
      sale_status_on_auction: 'Auktsionda',
      sale_status_awaiting_delivery: 'Yetkazilish kutilmoqda',
      sale_status_sold: 'Sotilgan',
      tab_my_products: 'Mening mahsulotlarim',
      sale_phase_all: 'Barchasi',
      sale_phase_in_auction: 'Auktsionda',
      sale_phase_in_delivery: 'Yetkazilishda',
      sale_phase_sold: 'Sotilgan',
      top_bids: 'Eng yaxshi takliflar',
      my_bid: 'Mening taklifim',
      leading: 'Yetakchi',
      min_bid_hint: 'Minimum {amount}',
      product_details: 'Mahsulot tafsilotlari',
      auction_info: 'Auktsion ma\'lumotlari',
      bid_increment: 'Taklif qadami',
      min_bid: 'Min taklif',
      auto_extend: 'Avto uzaytirish',
      yes: 'Ha',
      no: 'Yo\'q',
      winner: 'G\'olib',
      created: 'Yaratilgan',
      retract: 'Qaytarish',
      remove_bid: 'O\'chirish',
      bid_removed: 'Taklif auktsion egasi tomonidan o\'chirildi',
      bid_retracted: 'Taklif qaytarildi',
      rejected: 'Rad etilgan',
      winning: 'Yetakchi',
      live: 'JONLI',
      bids_all: 'Barcha',
      bids_new: 'Yangi',
      bids_top: 'Top',
      bids_rejected: 'Rad etilgan',
      product_created: 'Mahsulot muvaffaqiyatli yaratildi!',
      product_created_pending_moderation: 'Mahsulot yaratildi. Moderatsiyada. Tasdiqlangandan keyin ko\'rinadi.',
      product_updated: 'Mahsulot muvaffaqiyatli yangilandi!',
      product_deleted: 'Mahsulot o\'chirildi.',
      product_status_active: 'Faol',
      product_status_inactive: 'Nofaol',
      product_status_pending_moderation: 'Moderatsiyada',
      tab_moderation: 'Moderatsiya',
      moderation_hint: 'Tasdiqlanishi kerak bo\'lgan mahsulotlarni ko\'rib chiqing. Chop etish uchun tasdiqlang yoki sabab bilan rad eting (sotuvchi chatda ko\'radi).',
      moderation_empty: 'Moderatsiyada mahsulot yo\'q',
      reject_reason_title: 'Rad etish sababi',
      reject_reason_hint: 'Bu xabar sotuvchiga yuboriladi. Majburiy.',
      reject_reason_placeholder: 'Masalan: Rasm sifati past, aniqroq rasm yuklang.',
      reject_submit: 'Mahsulotni rad etish',
      approve_product: 'Tasdiqlash',
      reject_product: 'Rad etish',
      view_product: 'Ko\'rish',
      filter_status_all: 'Barchasi',
      filter_status_posted: 'Chop etilgan',
      filter_status_pending: 'Kutilmoqda',
      filter_status_rejected: 'Rad etilgan',
      edit_product: 'Mahsulotni tahrirlash',
      existing_images: 'Joriy rasmlar (saqlashda saqlanadi)',
      error_occurred: 'Xatolik yuz berdi',
      confirm_delete: 'Haqiqatan ham o\'chirmoqchimisiz?',
      fill_required_fields: 'Iltimos, majburiy maydonlarni to\'ldiring',
      enter_valid_bid: 'To\'g\'ri taklif summasini kiriting',
      failed_join_auction: 'Auktsion xonasiga qo\'shilishda xatolik',
      new_bid_by: '{name} yangi taklif berdi: {amount}',
      you_have_been_outbid: 'Sizning taklifingiz oshirildi!',
      auction_updated_price: 'Auktsion yangilandi: {amount}',
      auction_extended_to: 'Auktsion {time} gacha uzaytirildi',
      socket_error: 'Ulanish xatosi',
      new_message_from: '{name} dan yangi xabar: "{text}"',
      message_deleted: 'Xabar o\'chirildi',
      message_edited: 'Xabar tahrirlandi',
      all_notifications_read: 'Barcha bildirishnomalar o\'qilgan deb belgilandi',
      someone: 'Kimdir',
      just_now: 'Hozirgina',
      minutes_ago: '{n} daqiqa oldin',
      hours_ago: '{n} soat oldin',
      days_ago: '{n} kun oldin',
      feature_not_available: 'Bu funksiya mavjud emas.',
      rate_limit_exceeded: 'Juda ko\'p so\'rovlar. Bir ozdan keyin urinib ko\'ring.',
      balance_title: 'Balansingiz',
      balance_publications: 'publikatsiyalar',
      balance_top_up: 'Balansni to\'ldirish',
      transactions_title: 'Tranzaksiyalar',
      transactions_empty: 'Hali tranzaksiyalar yo\'q',
      transaction_top_up: 'Balans to\'ldirish',
      transaction_publication: '{n} publikatsiya',
      payment_success: 'To\'lov muvaffaqiyatli yakunlandi',
    },
    ru: {
      login_title: 'Second Bloom',
      login_subtitle: 'Войдите для тестирования платформы',
      country_code: 'Код страны',
      phone_number: 'Номер телефона',
      send_otp: 'Отправить OTP',
      code_sent_to: 'Код отправлен на',
      verify_code_label: 'Код подтверждения (6 цифр)',
      verify_signin: 'Подтвердить и войти',
      change_number: 'Изменить номер',
      signed_in_as: 'Вошли как',
      logout: 'Выйти',
      tab_products: 'Товары',
      tab_auctions: 'Аукционы',
      tab_chat: 'Чат',
      tab_notifications: 'Уведомления',
      search_products: 'Поиск товаров...',
      create_product: '+ Создать товар',
      no_products: 'Товары не найдены. Создайте первый!',
      empty_oh: 'Ой, пусто...',
      empty_add_nothing: 'Похоже, Вы еще ничего не добавили. Но никогда не поздно начать!',
      add_bouquet: 'Добавить букет',
      product_title: 'Название',
      product_description: 'Описание',
      product_price: 'Цена',
      product_currency: 'Валюта',
      product_category: 'Категория',
      product_condition: 'Состояние',
      product_size: 'Размер',
      product_tags: 'Теги (через запятую)',
      product_region: 'Регион',
      product_city: 'Город',
      product_district: 'Район',
      product_images: 'Изображения товара',
      product_images_hint: 'Загрузите до 10 изображений. Они будут прикреплены к товару.',
      product_create_auction: 'Создать с аукционом',
      auction_start_price: 'Стартовая цена',
      auction_duration: 'Длительность (часы)',
      auction_auto_extend: 'Авто-продление при поздних ставках',
      save: 'Сохранить',
      cancel: 'Отмена',
      back: '\u2190 Назад',
      delete: 'Удалить',
      edit: 'Редактировать',
      refresh: 'Обновить',
      loading: 'Загрузка...',
      no_auctions: 'Аукционы не найдены.',
      no_orders: 'Заказы не найдены.',
      order_number: 'Заказ #',
      order_create_and_chat: 'Создать заказ и открыть чат',
      order_status: 'Статус',
      order_amount: 'Сумма',
      order_buyer: 'Покупатель',
      order_seller: 'Продавец',
      order_update_status: 'Изменить статус',
      order_reject: 'Сделать отказ',
      order_customer_details: 'Данные заказчика',
      order_status_pending: 'В обработке',
      order_status_confirmed: 'В обработке',
      order_status_processing: 'В обработке',
      order_status_shipped: 'В процессе доставки',
      order_status_delivered: 'Доставка',
      order_status_delivery: 'Доставка',
      order_status_cancelled: 'Отменён',
      buy_product: 'Купить товар',
      all: 'Все',
      active: 'Активные',
      ended: 'Завершённые',
      current_price: 'Текущая цена',
      start_price: 'Стартовая цена',
      time_left: 'Осталось',
      place_bid: 'Сделать ставку',
      bid_amount: 'Введите сумму ставки...',
      my_bids: 'Мои ставки',
      leaderboard: 'Рейтинг',
      bids: 'Ставки',
      participants: 'Участники',
      total_bids: 'Всего ставок',
      bid_placed: 'Ставка успешно сделана!',
      no_bids: 'Ставок пока нет. Будьте первым!',
      conversations: 'Беседы',
      new_chat: 'Новый чат',
      start_chat_with_user: 'Начать чат с пользователем',
      search_by_name: 'Поиск по имени или телефону...',
      search_messages: 'Поиск сообщений...',
      search_no_results: 'Сообщения не найдены.',
      first_message_optional: 'Первое сообщение (необязательно)',
      type_message: 'Введите сообщение...',
      send: 'Отправить',
      online: 'Онлайн',
      offline: 'Офлайн',
      no_conversations: 'Бесед пока нет. Начните новый чат!',
      select_conversation: 'Выберите беседу или начните новый чат.',
      someone_typing: 'Кто-то печатает...',
      chat_role_seller: 'Продавец',
      chat_role_consumer: 'Покупатель',
      order_chat_label: 'Заказ',
      open_chat: 'Открыть чат',
      open_auction: 'Открыть аукцион',
      cancel_winner: 'Отменить победителя',
      cancel_winner_confirm: 'Отменить победителя аукциона и связанный заказ?',
      winner_cancelled: 'Победитель отменен',
      mark_all_read: 'Прочитать все',
      unread: 'Непрочитанные',
      no_notifications: 'Уведомлений пока нет.',
      views: 'просмотры',
      auction_ended: 'Аукцион завершён',
      auction_active: 'Аукцион активен',
      sale_status_available: 'Доступен',
      sale_status_on_auction: 'На аукционе',
      sale_status_awaiting_delivery: 'Ожидает доставки',
      sale_status_sold: 'Продан',
      tab_my_products: 'Мои товары',
      sale_phase_all: 'Все',
      sale_phase_in_auction: 'На аукционе',
      sale_phase_in_delivery: 'В доставке',
      sale_phase_sold: 'Проданные',
      top_bids: 'Топовые ставки',
      my_bid: 'Моя ставка',
      leading: 'Лидирует',
      min_bid_hint: 'Минимум {amount}',
      product_details: 'Детали товара',
      auction_info: 'Информация об аукционе',
      bid_increment: 'Шаг ставки',
      min_bid: 'Мин. ставка',
      auto_extend: 'Авто-продление',
      yes: 'Да',
      no: 'Нет',
      winner: 'Победитель',
      created: 'Создано',
      retract: 'Отозвать',
      remove_bid: 'Удалить',
      bid_removed: 'Ставка удалена владельцем аукциона',
      bid_retracted: 'Ставка отозвана',
      rejected: 'Отклонена',
      winning: 'Лидирует',
      live: 'LIVE',
      bids_all: 'Все заявки',
      bids_new: 'Новые',
      bids_top: 'Топовые',
      bids_rejected: 'Отклонённые',
      product_created: 'Товар успешно создан!',
      product_created_pending_moderation: 'Товар создан. Ожидает модерации и будет виден после одобрения.',
      product_updated: 'Товар успешно обновлён!',
      product_deleted: 'Товар удалён.',
      product_status_active: 'Активен',
      product_status_inactive: 'Неактивен',
      product_status_pending_moderation: 'На модерации',
      tab_moderation: 'Модерация',
      moderation_hint: 'Проверьте товары, ожидающие одобрения. Одобрите для публикации или отклоните с указанием причины (продавец увидит в чате).',
      moderation_empty: 'Нет товаров на модерации',
      reject_reason_title: 'Причина отклонения',
      reject_reason_hint: 'Это сообщение будет отправлено продавцу. Обязательно.',
      reject_reason_placeholder: 'Напр.: Низкое качество фото, загрузите чёткие изображения.',
      reject_submit: 'Отклонить товар',
      approve_product: 'Одобрить',
      reject_product: 'Отклонить',
      view_product: 'Просмотр',
      filter_status_all: 'Все',
      filter_status_posted: 'Опубликовано',
      filter_status_pending: 'На модерации',
      filter_status_rejected: 'Отклонено',
      edit_product: 'Редактировать товар',
      existing_images: 'Текущие изображения (сохраняются при сохранении)',
      error_occurred: 'Произошла ошибка',
      confirm_delete: 'Вы уверены, что хотите удалить?',
      fill_required_fields: 'Пожалуйста, заполните обязательные поля',
      enter_valid_bid: 'Введите корректную сумму ставки',
      failed_join_auction: 'Не удалось подключиться к аукциону',
      new_bid_by: 'Новая ставка от {name}: {amount}',
      you_have_been_outbid: 'Вашу ставку перебили!',
      auction_updated_price: 'Аукцион обновлён: {amount}',
      auction_extended_to: 'Аукцион продлён до {time}',
      socket_error: 'Ошибка подключения',
      new_message_from: 'Новое сообщение от {name}: «{text}»',
      message_deleted: 'Сообщение удалено',
      message_edited: 'Сообщение отредактировано',
      all_notifications_read: 'Все уведомления отмечены как прочитанные',
      someone: 'Кто-то',
      just_now: 'Только что',
      minutes_ago: '{n} мин. назад',
      hours_ago: '{n} ч. назад',
      days_ago: '{n} д. назад',
      feature_not_available: 'Эта функция недоступна.',
      rate_limit_exceeded: 'Слишком много запросов. Попробуйте через некоторое время.',
      balance_title: 'Ваш баланс',
      balance_publications: 'публикации',
      balance_top_up: 'Пополнить баланс',
      transactions_title: 'Транзакции',
      transactions_empty: 'Транзакций пока нет',
      transaction_top_up: 'Пополнение баланса',
      transaction_publication: '{n} публикация(ий)',
      payment_success: 'Оплата прошла успешно',
    },
  };

  let currentLang = localStorage.getItem('sb_lang') || 'en';

  function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS.en[key] || key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
  }

  let accessToken = localStorage.getItem('sb_access_token');
  let currentUser = JSON.parse(localStorage.getItem('sb_user') || 'null');
  let conversationSocket = null;
  let auctionSocket = null;
  let paymentSocket = null;
  let currentTab = 'products';

  let productsPage = 1;
  let productsCache = [];
  let productsTotalPages = 1;
  let currentProductDetail = null;
  let productsMyProducts = false;
  let productsSalePhase = 'all';
  let productCounts = { all: 0, inAuction: 0, sold: 0, inDelivery: 0 };
  let categoriesCache = [];
  let conditionsCache = [];
  let sizesCache = [];

  let auctionsPage = 1;
  let auctionsCache = [];
  let auctionsTotalPages = 1;
  let moderationPage = 1;
  let moderationTotalPages = 1;
  let rejectModalProductId = null;
  let currentAuctionId = null;
  let currentAuctionCreatorId = null;
  let currentAuctionEnded = false;
  let auctionTimerInterval = null;
  let auctionBidsView = 'all';

  let currentConversationId = null;
  let conversationsCache = [];
  const onlineUsers = new Set();
  let typingTimeout = null;
  let pendingChatProductId = null;
  let pendingChatOtherUserId = null;

  let notificationsCache = [];
  let notifFilter = 'all';

  const $ = (id) => document.getElementById(id);
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
  }

  function formatPrice(price, currency) {
    if (price == null) return '--';
    const num = Number(price);
    return num.toLocaleString() + ' ' + (currency || 'UZS');
  }

  function formatDate(iso) {
    if (iso === undefined || iso === null) return '--';
    const date = (typeof iso === 'string' || typeof iso === 'number') ? new Date(iso) : (iso instanceof Date ? iso : new Date(iso));
    if (!(date instanceof Date) || typeof date.getTime !== 'function' || isNaN(date.getTime())) return '--';
    return date.toLocaleString();
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const d = iso instanceof Date ? iso : new Date(iso);
    if (typeof d.getTime !== 'function' || isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('just_now');
    if (mins < 60) return t('minutes_ago').replace('{n}', mins);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('hours_ago').replace('{n}', hours);
    const days = Math.floor(hours / 24);
    return t('days_ago').replace('{n}', days);
  }

  function timeLeft(endTime) {
    if (endTime === undefined || endTime === null) return '--';
    const date = (typeof endTime === 'string' || typeof endTime === 'number') ? new Date(endTime) : (endTime instanceof Date ? endTime : new Date(endTime));
    if (!(date instanceof Date) || typeof date.getTime !== 'function' || isNaN(date.getTime())) return '--';
    const diff = date.getTime() - Date.now();
    if (diff <= 0) return t('ended');
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function saleStatusLabel(saleStatus) {
    const key = {
      available: 'sale_status_available',
      onAuction: 'sale_status_on_auction',
      awaitingDelivery: 'sale_status_awaiting_delivery',
      sold: 'sale_status_sold',
    }[saleStatus || ''];
    return key ? t(key) : (saleStatus || '');
  }

  function productStatusLabel(status) {
    const key = {
      PUBLISHED: 'product_status_active',
      DRAFT: 'product_status_inactive',
      REJECTED: 'product_status_inactive',
      PENDING: 'product_status_pending_moderation',
    }[status || ''];
    return key ? t(key) : (status || '');
  }

  function updateAuthStateBadge(kind, text) {
    const el = $('auth-state');
    if (!el) return;
    el.classList.remove('ok', 'fail');
    if (kind === 'ok') el.classList.add('ok');
    if (kind === 'fail') el.classList.add('fail');
    el.textContent = text;
  }

  function refreshAuthStateBadge() {
    if (!accessToken) {
      updateAuthStateBadge('fail', 'No auth');
      return;
    }
    const role = currentUser?.role || 'unknown';
    const tail = accessToken.slice(-6);
    updateAuthStateBadge('ok', `Auth ${role} ..${tail}`);
  }

  function runAuthCheck() {
    if (!accessToken) {
      updateAuthStateBadge('fail', 'No auth');
      showToast('No access token', 'error');
      return;
    }
    api('/users/profile')
      .then((user) => {
        if (user?.id) {
          currentUser = user;
          localStorage.setItem('sb_user', JSON.stringify(user));
          updateModerationTabVisibility();
        }
        refreshAuthStateBadge();
        showToast('Authorization OK', 'success');
      })
      .catch((err) => {
        updateAuthStateBadge('fail', 'Auth failed');
        showToast(err.message || 'Authorization failed', 'error');
      });
  }

  function orderStatusLabel(status) {
    const key = {
      PENDING: 'order_status_pending',
      CONFIRMED: 'order_status_confirmed',
      PROCESSING: 'order_status_processing',
      SHIPPED: 'order_status_shipped',
      DELIVERED: 'order_status_delivered',
      DELIVERY: 'order_status_delivery',
      CANCELLED: 'order_status_cancelled',
    }[status || ''];
    return key ? t(key) : (status || '');
  }

  function orderStatusClass(status) {
    if (status === 'CANCELLED') return 'status-cancelled';
    if (status === 'DELIVERY' || status === 'DELIVERED') return 'status-delivered';
    return 'status-pending';
  }

  function renderChatOrderCard(conv) {
    const cardEl = $('chat-order-card');
    const statusEl = $('chat-order-status-label');
    const productEl = $('chat-order-product');
    const numberEl = $('chat-order-number');
    const dateEl = $('chat-order-date');
    const amountEl = $('chat-order-amount');
    const customerEl = $('chat-order-customer');
    const actionsEl = $('chat-order-actions');
    const dropdownEl = $('chat-order-status-dropdown');

    if (!cardEl || !statusEl || !productEl || !numberEl || !dateEl || !amountEl || !customerEl || !actionsEl || !dropdownEl) {
      return;
    }

    actionsEl.innerHTML = '';
    dropdownEl.classList.add('hidden');
    dropdownEl.innerHTML = '';

    const order = conv?.pinnedOrder;
    if (!order) {
      hide(cardEl);
      return;
    }

    show(cardEl);

    const statusClass = orderStatusClass(order.status);
    statusEl.className = `chat-order-card-status ${statusClass}`;
    statusEl.innerHTML = `<span class=\"status-dot\"></span>${escapeHtml(orderStatusLabel(order.status))}`;

    const productImageUrl = conv?.pinnedProduct?.imageUrl || '';
    productEl.innerHTML = productImageUrl
      ? `<img src=\"${escapeHtml(productImageUrl)}\" alt=\"\" />`
      : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#8b98a5;font-size:.75rem">—</div>';

    numberEl.textContent = `${t('order_number')} ${order.orderNumber || order.id || ''}`;
    const progressDate = order.progress?.deliveredAt || order.progress?.shippedAt || conv?.updatedAt || null;
    dateEl.textContent = progressDate ? formatDate(progressDate) : '';
    amountEl.textContent = formatPrice(order.amount, conv?.pinnedProduct?.currency || 'UZS');

    const isSeller = !!(currentUser?.id && conv?.seller?.id && currentUser.id === conv.seller.id);
    const buyer = conv?.buyer;
    if (isSeller && buyer) {
      const buyerName = [buyer.firstName, buyer.lastName].filter(Boolean).join(' ') || buyer.phoneNumber || '';
      customerEl.innerHTML =
        `<span class=\"customer-label\">${escapeHtml(t('order_customer_details'))}</span>` +
        `<div class=\"customer-row\">${escapeHtml(buyerName)}</div>`;
    } else {
      customerEl.innerHTML = '';
    }

    if (order.auctionId) {
      const openAuctionBtn = document.createElement('button');
      openAuctionBtn.type = 'button';
      openAuctionBtn.className = 'btn secondary small';
      openAuctionBtn.textContent = t('open_auction');
      openAuctionBtn.addEventListener('click', () => {
        window._goToAuction(order.auctionId);
      });
      actionsEl.appendChild(openAuctionBtn);
    }

    const canCancelWinner = !!order.auctionId && (isSeller || currentUser?.role === 'ADMIN');
    if (canCancelWinner) {
      const cancelWinnerBtn = document.createElement('button');
      cancelWinnerBtn.type = 'button';
      cancelWinnerBtn.className = 'btn danger small';
      cancelWinnerBtn.textContent = t('cancel_winner');
      cancelWinnerBtn.addEventListener('click', () => {
        if (!confirm(t('cancel_winner_confirm'))) return;
        cancelWinnerBtn.disabled = true;
        api(`/auctions/${order.auctionId}/winner`, { method: 'DELETE' })
          .then(() => {
            showToast(t('winner_cancelled'), 'success');
            loadConversations();
            if (currentConversationId) {
              const currentConv = conversationsCache.find((c) => c.id === currentConversationId);
              if (currentConv) renderChatOrderCard(currentConv);
            }
          })
          .catch((err) => showToast(err.message, 'error'))
          .finally(() => {
            cancelWinnerBtn.disabled = false;
          });
      });
      actionsEl.appendChild(cancelWinnerBtn);
    }
  }

  function getBidRowHtml(b, currency, opts) {
    const bidder = b.bidder || {};
    const firstName = (bidder.firstName || '').trim();
    const lastName = (bidder.lastName || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || bidder.phoneNumber || t('someone');
    const avatarUrl = bidder.avatarUrl && bidder.avatarUrl.trim() ? bidder.avatarUrl.trim() : '';
    const avatarHtml = avatarUrl
      ? '<img class="auction-bid-avatar" src="' + escapeHtml(avatarUrl) + '" alt="" />'
      : '<span class="auction-bid-avatar-placeholder">' + (name.charAt(0) || '?').toUpperCase() + '</span>';
    const showWinner = opts && opts.showWinnerBadge;
    const showLeading = (opts && opts.showLeadingBadge) || b.isWinning;
    let badge = '';
    if (showWinner) badge = '<span class="auction-bid-leading auction-bid-winner">' + t('winner') + '</span>';
    else if (showLeading) badge = '<span class="auction-bid-leading">' + t('leading') + '</span>';
    const isHighlight = showWinner || showLeading;
    const rowClass = (opts && opts.rowClass) ? ' ' + opts.rowClass : '';
    return '<div class="auction-bid-row' + rowClass + (isHighlight ? ' is-leading' : '') + '">' +
      '<div class="auction-bid-user">' + avatarHtml + '<div class="auction-bid-info"><span class="auction-bid-name">' + escapeHtml(name) + '</span>' + badge + '</div></div>' +
      '<div class="auction-bid-amount">' + formatPrice(b.amount, currency || 'UZS') + '</div></div>';
  }

  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }

  function api(path, options = {}) {
    const url = `${API_BASE}${API_PREFIX}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept-Language': currentLang || 'en',
      ...options.headers,
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    if (options.body instanceof FormData) delete headers['Content-Type'];
    return fetch(url, { ...options, headers }).then(async (res) => {
      const text = await res.text();
      if (res.status === 204) return null;
      let raw;
      try { raw = text ? JSON.parse(text) : null; } catch { throw new Error(text || res.statusText); }
      if (!res.ok) {
        const err = raw?.error || raw;
        const message = typeof err === 'object' && err?.message ? err.message : (raw?.message || res.statusText);
        const retryAfter = res.headers.get('Retry-After');
        if (res.status === 429) {
          const msg = retryAfter ? `${message} (Retry after ${retryAfter}s)` : message;
          throw new Error(msg);
        }
        throw new Error(message);
      }
      return raw?.data !== undefined ? raw.data : raw;
    });
  }

  function showLogin() {
    show($('login-screen'));
    hide($('main-app'));
  }

  function showApp() {
    hide($('login-screen'));
    show($('main-app'));
    const name = currentUser
      ? ([currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') || currentUser.phoneNumber || currentUser.id)
      : '';
    $('user-display-name').textContent = name;
    updateModerationTabVisibility();
    refreshAuthStateBadge();
    switchTab('products');
    connectConversationSocket();
    loadNotificationCount();
  }

  function onSendOtp() {
    const countryCode = $('country-code').value.trim();
    const phoneNumber = $('phone-number').value.trim();
    setLoginError('');
    if (!countryCode || !phoneNumber) { setLoginError('Enter country code and phone number'); return; }
    $('btn-send-otp').disabled = true;
    api('/auth/otp', { method: 'POST', body: JSON.stringify({ countryCode, phoneNumber }) })
      .then(() => {
        $('verify-phone').textContent = countryCode + phoneNumber;
        hide($('login-step-send'));
        show($('login-step-verify'));
        $('otp-code').value = '';
        $('otp-code').focus();
      })
      .catch((err) => setLoginError(err.message))
      .finally(() => { $('btn-send-otp').disabled = false; });
  }

  function onVerify() {
    const countryCode = $('country-code').value.trim();
    const phoneNumber = $('phone-number').value.trim();
    const code = $('otp-code').value.trim();
    setLoginError('');
    if (!code || code.length !== 6) { setLoginError('Enter 6-digit code'); return; }
    $('btn-verify').disabled = true;
    api('/auth/verify', { method: 'POST', body: JSON.stringify({ countryCode, phoneNumber, code: parseInt(code, 10) }) })
      .then((data) => {
        accessToken = data.accessToken;
        currentUser = data.user;
        localStorage.setItem('sb_access_token', accessToken);
        localStorage.setItem('sb_user', JSON.stringify(currentUser));
        showApp();
        const fcmToken = window.TEST_APP_FCM_TOKEN || localStorage.getItem('sb_fcm_token') || '';
        if (fcmToken && fcmToken.length >= 10) {
          api('/users/fcm-token', { method: 'POST', body: JSON.stringify({ fcmToken }) }).catch(() => {});
        }
      })
      .catch((err) => setLoginError(err.message))
      .finally(() => { $('btn-verify').disabled = false; });
  }

  function onLogout() {
    api('/auth/logout', { method: 'POST' }).catch(() => {});
    accessToken = null;
    currentUser = null;
    localStorage.removeItem('sb_access_token');
    localStorage.removeItem('sb_user');
    if (conversationSocket) { conversationSocket.disconnect(); conversationSocket = null; }
    if (paymentSocket) { paymentSocket.disconnect(); paymentSocket = null; }
    if (auctionSocket) { auctionSocket.disconnect(); auctionSocket = null; }
    currentConversationId = null;
    currentAuctionId = null;
    updateAuthStateBadge('fail', 'No auth');
    showLogin();
    hide($('login-step-verify'));
    show($('login-step-send'));
  }

  function setLoginError(msg) {
    const el = $('login-error');
    el.textContent = msg || '';
    if (msg) show(el); else hide(el);
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `panel-${tab}`);
    });
    if (tab === 'products') loadProducts();
    else if (tab === 'auctions') loadAuctions();
    else if (tab === 'orders') { loadOrders(); connectPaymentSocket(); }
    else if (tab === 'chat') { loadConversations(); connectConversationSocket(); }
    else if (tab === 'moderation') loadModeration();
    else if (tab === 'notifications') loadNotifications();
  }

  function updateModerationTabVisibility() {
    const tabEl = document.getElementById('tab-moderation');
    if (!tabEl) return;
    const isAdminOrMod = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR');
    if (isAdminOrMod) tabEl.classList.remove('hidden');
    else tabEl.classList.add('hidden');
  }

  function loadModeration() {
    const grid = $('moderation-grid');
    const emptyEl = $('moderation-empty');
    const loadingEl = $('moderation-loading');
    if (!grid || !emptyEl || !loadingEl) return;
    hide(emptyEl);
    show(loadingEl);
    grid.innerHTML = '';
    const params = new URLSearchParams({ page: String(moderationPage), limit: '12' });
    const url = `${API_BASE}${API_PREFIX}/products/moderation?${params}`;
    const headers = { 'Content-Type': 'application/json', 'Accept-Language': currentLang || 'en' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    fetch(url, { headers })
      .then((r) => {
        if (!r.ok) return r.json().then((err) => Promise.reject(new Error(err?.message || err?.error?.message || r.statusText)));
        return r.json();
      })
      .then((res) => {
        hide(loadingEl);
        const items = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
        const meta = res?.meta || {};
        moderationTotalPages = (meta.totalPages ?? (meta.total != null ? Math.ceil(meta.total / (meta.limit || 12)) : 1)) || 1;
        if (items.length === 0) {
          show(emptyEl);
          return;
        }
        hide(emptyEl);
        items.forEach((p) => {
          const card = document.createElement('div');
          card.className = 'card';
          const title = (p.title && (typeof p.title === 'object' ? (p.title.en || p.title.uz || p.title.ru || '') : String(p.title))) || 'Product';
          const imgUrl = p.images?.[0]?.url || p.images?.[0]?.file?.url || '';
          const sellerName = [p.seller?.firstName, p.seller?.lastName].filter(Boolean).join(' ') || p.seller?.phoneNumber || '';
          card.innerHTML = `
            <div class="card-body">
              ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="" class="card-img" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:.5rem" />` : ''}
              <h3 class="card-title">${escapeHtml(title)}</h3>
              <div class="card-meta">${escapeHtml(sellerName)}</div>
              <div class="card-price">${formatPrice(Number(p.price ?? 0), p.currency || 'UZS')}</div>
              <div style="display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap">
                <button type="button" class="btn secondary small moderation-btn-view" data-product-id="${escapeHtml(p.id)}">${t('view_product')}</button>
                <button type="button" class="btn primary small moderation-btn-approve" data-product-id="${escapeHtml(p.id)}">${t('approve_product')}</button>
                <button type="button" class="btn secondary small moderation-btn-reject" data-product-id="${escapeHtml(p.id)}">${t('reject_product')}</button>
              </div>
            </div>`;
          const viewBtn = card.querySelector('.moderation-btn-view');
          const approveBtn = card.querySelector('.moderation-btn-approve');
          const rejectBtn = card.querySelector('.moderation-btn-reject');
          if (viewBtn) viewBtn.addEventListener('click', () => { switchTab('products'); showProductDetail(p.id); });
          if (approveBtn) approveBtn.addEventListener('click', () => onModerationApprove(p.id));
          if (rejectBtn) rejectBtn.addEventListener('click', () => openRejectModal(p.id));
          grid.appendChild(card);
        });
        updateModerationPagination();
      })
      .catch((err) => {
        hide(loadingEl);
        showToast(err.message || 'Failed to load moderation list', 'error');
        show(emptyEl);
        updateModerationPagination();
      });
  }

  function updateModerationPagination() {
    const info = $('moderation-page-info');
    const prev = $('moderation-prev');
    const next = $('moderation-next');
    if (info) info.textContent = `Page ${moderationPage} / ${moderationTotalPages}`;
    if (prev) prev.disabled = moderationPage <= 1;
    if (next) next.disabled = moderationPage >= moderationTotalPages;
  }

  function onModerationApprove(productId) {
    api(`/products/${productId}/moderate`, { method: 'PATCH', body: JSON.stringify({ action: 'approve' }) })
      .then(() => { showToast(t('product_updated') || 'Product approved', 'success'); loadModeration(); })
      .catch((err) => showToast(err.message, 'error'));
  }

  function openRejectModal(productId) {
    rejectModalProductId = productId;
    const overlay = $('reject-modal-overlay');
    const input = $('reject-reason-input');
    if (input) input.value = '';
    if (overlay) show(overlay);
  }

  function closeRejectModal() {
    rejectModalProductId = null;
    hide($('reject-modal-overlay'));
  }

  function onSubmitReject() {
    const reason = ($('reject-reason-input')?.value || '').trim();
    if (!reason) {
      showToast(t('reject_reason_hint') || 'Reason is required', 'error');
      return;
    }
    if (!rejectModalProductId) { closeRejectModal(); return; }
    const id = rejectModalProductId;
    api(`/products/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ action: 'reject', rejectionReason: reason }) })
      .then(() => { showToast(t('product_updated') || 'Product rejected', 'success'); closeRejectModal(); loadModeration(); })
      .catch((err) => showToast(err.message, 'error'));
  }

  function loadProducts() {
    const search = $('product-search-input').value.trim();
    hide($('products-empty'));
    show($('products-loading'));
    $('products-grid').innerHTML = '';

    const params = new URLSearchParams({ page: String(productsPage), limit: '12' });
    if (search) params.set('search', search);
    if (productsMyProducts && currentUser?.id) {
      params.set('sellerId', currentUser.id);
      if (productsSalePhase && productsSalePhase !== 'all') params.set('salePhase', productsSalePhase);
    }
    const statusFilterEl = document.getElementById('products-status-filter');
    const statusFilter = statusFilterEl?.value?.trim();
    if (statusFilter) params.set('status', statusFilter);

    api(`/products?${params}`)
      .then((res) => {
        hide($('products-loading'));
        const items = res.data || res || [];
        productsCache = Array.isArray(items) ? items : [];
        productsTotalPages = res.meta?.totalPages || 1;
        renderProducts(productsCache);
        updateProductsPagination();
        if (productsMyProducts && currentUser?.id) loadProductCounts();
      })
      .catch((err) => {
        hide($('products-loading'));
        showToast(err.message, 'error');
        productsCache = [];
        renderProducts([]);
      });
  }

  function renderProducts(products) {
    const grid = $('products-grid');
    grid.innerHTML = '';
    if (products.length === 0) { show($('products-empty')); return; }
    hide($('products-empty'));

    products.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'card';
      const statusClass = p.status === 'PUBLISHED' ? 'status-active' : p.status === 'PENDING' ? 'status-pending' : 'status-ended';
      const hasAuction = p.activeAuction;
      const saleStatus = p.saleStatus || 'available';
      const saleStatusClass = { available: 'status-active', onAuction: 'status-pending', awaitingDelivery: 'status-pending', sold: 'status-ended' }[saleStatus] || '';
      const showProductStatusBadge = p.status === 'PENDING' || p.status === 'REJECTED' || p.status === 'DRAFT';
      const tags = (p.tags || []).map((tg) => `<span class="tag">${escapeHtml(tg)}</span>`).join('');
      const isAuctionActive = hasAuction && hasAuction.status === 'ACTIVE' && new Date(hasAuction.endTime) > new Date();
      const imgUrl = (p.images && p.images[0]) ? p.images[0].url : '';
      let dateStr = '';
      if (p.createdAt) {
        const createdDate = (typeof p.createdAt === 'string' || typeof p.createdAt === 'number') ? new Date(p.createdAt) : (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt));
        if (createdDate instanceof Date && !isNaN(createdDate.getTime())) {
          dateStr = createdDate.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'uz' ? 'uz-UZ' : 'en-US', { day: 'numeric', month: 'long' });
        }
      }
      const bidCount = (hasAuction && hasAuction.totalBids) ? hasAuction.totalBids : 0;
      card.innerHTML = `
        <div class="card-with-image">
          ${imgUrl ? `<img class="card-image" src="${escapeHtml(imgUrl)}" alt="" />` : '<div class="card-image" style="display:flex;align-items:center;justify-content:center;color:#5c6470;font-size:.75rem">—</div>'}
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.35rem;flex-wrap:wrap;gap:.35rem">
              ${showProductStatusBadge ? `<span class="card-status ${statusClass}">${escapeHtml(productStatusLabel(p.status))}</span>` : `<span class="card-status ${saleStatusClass}">${escapeHtml(saleStatusLabel(saleStatus))}</span>`}
              ${hasAuction && !showProductStatusBadge ? '<span class="card-status status-pending">Auction</span>' : ''}
            </div>
            <h3 class="card-title">${escapeHtml(p.title)}</h3>
            ${dateStr ? `<div class="card-meta">${escapeHtml(dateStr)}</div>` : ''}
            <div class="card-price">${formatPrice(hasAuction ? p.activeAuction.currentPrice : p.price, p.currency)}</div>
            ${hasAuction ? `<div style="font-size:.8rem;color:#eab308;margin-top:.25rem">${isAuctionActive ? timeLeft(p.activeAuction.endTime) : t('ended')}${bidCount > 0 ? ' · ' + bidCount + ' ' + t('bids') : ''}</div>` : ''}
            <div class="card-tags">${tags}</div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => showProductDetail(p.id));
      grid.appendChild(card);
    });
  }

  function renderBalanceAndPayments(user, payments) {
    const balanceEl = $('balance-amount');
    const creditsCountEl = $('balance-credits-count');
    if (balanceEl && creditsCountEl) {
      const balance = Number(user?.balance ?? 0);
      const credits = user?.publicationCredits ?? 0;
      balanceEl.textContent = formatPrice(balance, 'UZS');
      creditsCountEl.textContent = String(credits);
    }

    const listEl = $('payment-history-list');
    const emptyEl = $('payment-history-empty');
    if (!listEl || !emptyEl) return;
    listEl.innerHTML = '';
    const items = Array.isArray(payments) ? payments : payments?.data || [];
    if (!items.length) {
      show(emptyEl);
      return;
    }
    hide(emptyEl);

    items.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'payment-item';
      const isTopUp = p.paymentType === 'TOP_UP';
      const amountNum = Number(p.amount ?? 0);
      const created = p.createdAt ? new Date(p.createdAt) : null;
      const dateStr =
        created && !isNaN(created.getTime())
          ? created.toLocaleString()
          : '';
      const title = isTopUp
        ? t('transaction_top_up')
        : t('transaction_publication').replace(
            '{n}',
            String(p.quantity ?? 1),
          );
      const amountText =
        (isTopUp ? '+' : '-') + formatPrice(amountNum, 'UZS');

      div.innerHTML = `
        <div class="payment-left">
          <div class="payment-title">${escapeHtml(title)}</div>
          <div class="payment-meta">${escapeHtml(dateStr || '')}</div>
        </div>
        <div class="payment-amount ${
          isTopUp ? 'positive' : 'negative'
        }">${amountText}</div>
      `;
      listEl.appendChild(div);
    });
  }

  function loadOrders() {
    const status = $('orders-status-filter')?.value || '';
    const ordersList = $('orders-list');
    const ordersEmpty = $('orders-empty');
    const ordersLoading = $('orders-loading');
    if (ordersLoading) show(ordersLoading);
    if (ordersEmpty) hide(ordersEmpty);
    if (ordersList) ordersList.innerHTML = '';

    const params = new URLSearchParams({ page: '1', limit: '20' });
    if (status) params.set('status', status);

    Promise.all([
      api('/users/profile').catch(() => currentUser),
      api('/payments/history?page=1&limit=50').catch(() => ({ data: [] })),
      api(`/orders?${params.toString()}`).catch(() => ({ data: [] })),
    ])
      .then(([user, payments, ordersRes]) => {
        if (user && user.id) {
          currentUser = user;
          localStorage.setItem('sb_user', JSON.stringify(user));
          updateModerationTabVisibility();
        }
        const paymentList = Array.isArray(payments) ? payments : payments?.data || [];
        renderBalanceAndPayments(currentUser, paymentList);

        const orders = Array.isArray(ordersRes)
          ? ordersRes
          : ordersRes?.data || [];
        if (!ordersList || !ordersEmpty) return;
        if (!orders.length) {
          show(ordersEmpty);
          return;
        }
        hide(ordersEmpty);
        orders.forEach((o) => {
          const div = document.createElement('div');
          div.className = 'card';
          const dateStr = o.createdAt
            ? new Date(o.createdAt).toLocaleString()
            : '';
          div.innerHTML = `
            <div class="card-body">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem">
                <span class="card-status">${escapeHtml(
                  String(o.status || ''),
                )}</span>
                <span class="card-status">${escapeHtml(
                  String(o.paymentStatus || ''),
                )}</span>
              </div>
              <div class="card-meta">${escapeHtml(
                String(o.orderNumber || o.id || ''),
              )}</div>
              <div class="card-price">${formatPrice(
                Number(o.amount ?? 0),
                'UZS',
              )}</div>
              <div class="card-meta">${escapeHtml(dateStr || '')}</div>
            </div>
          `;
          ordersList.appendChild(div);
        });
      })
      .catch((err) => {
        showToast(err.message, 'error');
        if (ordersEmpty) show(ordersEmpty);
      })
      .finally(() => {
        if (ordersLoading) hide(ordersLoading);
      });
  }

  function loadProductCounts() {
    api('/products/counts')
      .then((counts) => {
        productCounts = counts || { all: 0, inAuction: 0, sold: 0, inDelivery: 0 };
        const allEl = $('sale-phase-count-all');
        const auctionEl = $('sale-phase-count-in_auction');
        const deliveryEl = $('sale-phase-count-in_delivery');
        const soldEl = $('sale-phase-count-sold');
        if (allEl) allEl.textContent = productCounts.all;
        if (auctionEl) auctionEl.textContent = productCounts.inAuction;
        if (deliveryEl) deliveryEl.textContent = productCounts.inDelivery;
        if (soldEl) soldEl.textContent = productCounts.sold;
      })
      .catch(() => {});
  }

  function updateProductsPagination() {
    $('products-page-info').textContent = `Page ${productsPage} / ${productsTotalPages}`;
    $('products-prev').disabled = productsPage <= 1;
    $('products-next').disabled = productsPage >= productsTotalPages;
  }

  function showProductDetail(id) {
    hide($('products-list-view'));
    show($('product-detail-view'));
    $('product-detail-content').innerHTML = `<div class="loading-state">${t('loading')}</div>`;

    api(`/products/${id}?incrementViews=true`)
      .then((product) => {
        const p = product;
        currentProductDetail = p;
        window._currentProductDetail = p;
        const hasAuction = p.activeAuction;
        const statusClass = p.status === 'PUBLISHED' ? 'status-active' : p.status === 'PENDING' ? 'status-pending' : 'status-inactive';
        const canManage = !!currentUser && (p.sellerId === currentUser.id || currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR');
        const isOwner = !!currentUser && p.sellerId === currentUser.id;
        const tags = (p.tags || []).map((tg) => `<span class="tag">${escapeHtml(tg)}</span>`).join('');

        let auctionHtml = '';
        if (hasAuction) {
          const a = p.activeAuction;
          const aStatusClass = a.status === 'ACTIVE' ? 'status-active' : 'status-ended';
          const isAuctionActive = a.status === 'ACTIVE' && new Date(a.endTime) > new Date();
          const isAuctionEnded = a.status !== 'ACTIVE';
          auctionHtml = `
            <div class="detail-section">
              <h4>${t('auction_info')}</h4>
              <div class="detail-row"><span class="detail-label">Status</span><span class="card-status ${aStatusClass}">${a.status}</span></div>
              <div class="detail-row"><span class="detail-label">${t('current_price')}</span><span class="detail-value" style="color:#22c55e;font-size:1.2rem">${formatPrice(a.currentPrice, p.currency)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('time_left')}</span><span class="detail-value auction-timer ${!isAuctionActive ? 'ended' : ''}">${isAuctionActive ? timeLeft(a.endTime) : t('ended')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('total_bids')}</span><span class="detail-value">${a.totalBids || 0}</span></div>
              <div class="detail-auction-bids-section">
                <h4 class="detail-subheading">${t('top_bids')}</h4>
                <div id="product-detail-auction-bids" class="detail-auction-bids" data-auction-id="${a.id}" data-currency="${escapeHtml(p.currency || 'UZS')}" data-ended="${isAuctionEnded ? '1' : '0'}">${t('loading')}</div>
              </div>
              ${isAuctionActive ? `<div style="margin-top:1rem"><button class="btn primary" onclick="window._openAuctionModal('${a.id}', window._currentProductDetail)">${t('place_bid')} &rarr;</button></div>` : ''}
            </div>
          `;
        }

        const saleStatus = p.saleStatus || 'available';
        const saleStatusClass = { available: 'status-active', onAuction: 'status-pending', awaitingDelivery: 'status-pending', sold: 'status-ended' }[saleStatus] || '';
        $('product-detail-content').innerHTML = `
          <div class="detail-content">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.75rem">
              <div>
                <h2 class="detail-title">${escapeHtml(p.title)}</h2>
                <span class="card-status ${statusClass}">${escapeHtml(productStatusLabel(p.status))}</span>
                ${p.status !== 'PENDING' ? `<span class="card-status ${saleStatusClass}" style="margin-left:.35rem">${saleStatusLabel(saleStatus)}</span>` : ''}
              </div>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                ${p.sellerId && p.sellerId !== currentUser?.id ? `<button class="btn primary small" onclick="window._startChatWithProduct(window._currentProductDetail)">Contact seller</button>` : ''}
                ${p.sellerId && p.sellerId !== currentUser?.id && !hasAuction ? `<button class="btn success small" id="btn-buy-product">${t('buy_product')}</button>` : ''}
                ${canManage ? `<button class="btn primary small" onclick="window._editProduct()">${t('edit')}</button>` : ''}
                ${canManage ? `<button class="btn danger small" onclick="window._deleteProduct('${p.id}')">${t('delete')}</button>` : ''}
              </div>
            </div>
            <div class="detail-section">
              <h4>${t('product_details')}</h4>
              <div class="detail-row"><span class="detail-label">${t('product_price')}</span><span class="detail-value card-price">${formatPrice(p.price, p.currency)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_category')}</span><span class="detail-value">${escapeHtml(resolveLabel(p.category || {}, 'name') || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_condition')}</span><span class="detail-value">${escapeHtml(resolveLabel(p.condition || {}, 'name') || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_size')}</span><span class="detail-value">${escapeHtml(resolveLabel(p.size || {}, 'name') || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_region')}</span><span class="detail-value">${escapeHtml([p.region, p.city].filter(Boolean).join(', ') || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('views')}</span><span class="detail-value">${p.views || 0}</span></div>
              <div class="detail-row"><span class="detail-label">${t('created')}</span><span class="detail-value">${formatDate(p.createdAt)}</span></div>
              ${p.description ? `<div style="margin-top:.75rem;color:#8b98a5;font-size:.9rem">${escapeHtml(p.description)}</div>` : ''}
              <div class="card-tags" style="margin-top:.75rem">${tags}</div>
            </div>
            ${isOwner ? `
              <div class="interested-buyers-wrap">
                <h4 class="interested-buyers-title">Interested buyers</h4>
                <div id="interested-buyers-list" class="interested-buyers-list">
                  <div class="interested-buyers-empty">${t('loading')}</div>
                </div>
              </div>
            ` : ''}
            ${auctionHtml}
          </div>
        `;

        if (isOwner) {
          loadInterestedBuyers(p.id);
        }

        const buyBtn = $('btn-buy-product');
        if (buyBtn) {
          buyBtn.addEventListener('click', () => {
            const prod = currentProductDetail || p;
            if (!prod || prod.sellerId === currentUser?.id) return;
            buyBtn.disabled = true;
            const amount = Number(prod.price) || 0;
            api('/orders', { method: 'POST', body: JSON.stringify({ productId: prod.id, amount }) })
              .then((order) => {
                showToast(t('buy_product') + ' ✓', 'success');
                switchTab('chat');
                window._openChatForOrder(order.id);
              })
              .catch((err) => { showToast(err.message || 'Failed to create order', 'error'); })
              .finally(() => { buyBtn.disabled = false; });
          });
        }
        if (hasAuction && p.activeAuction?.status === 'ACTIVE') startAuctionTimer(p.activeAuction);
        if (hasAuction) {
          connectAuctionSocket(p.activeAuction.id);
          const a = p.activeAuction;
          const currency = p.currency || 'UZS';
          const isEnded = a.status !== 'ACTIVE';
          const container = $('product-detail-auction-bids');
          if (container) {
            api(`/bids?auctionId=${a.id}&view=top&limit=20`).then((res) => {
              const list = Array.isArray(res) ? res : (res?.data ?? []);
              const sorted = [...list].sort((x, y) => Number(y.amount) - Number(x.amount));
              const top = sorted.slice(0, 10);
              if (container.getAttribute('data-auction-id') !== a.id) return;
              if (top.length === 0) {
                container.innerHTML = '<p class="auction-modal-hint">' + t('no_bids') + '</p>';
              } else {
                container.innerHTML = top.map((b, i) => {
                  const showWinner = isEnded && i === 0;
                  const showLeading = !isEnded && (b.isWinning || i === 0);
                  return getBidRowHtml(b, currency, { showWinnerBadge: showWinner, showLeadingBadge: showLeading });
                }).join('');
              }
            }).catch(() => {
              if (container.getAttribute('data-auction-id') === a.id) container.innerHTML = '<p class="auction-modal-hint">' + t('no_bids') + '</p>';
            });
          }
        }
      })
      .catch((err) => {
        $('product-detail-content').innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
      });
  }

  function loadInterestedBuyers(productId) {
    const listEl = $('interested-buyers-list');
    if (!listEl || !productId) return;
    listEl.innerHTML = '<div class="interested-buyers-empty">' + t('loading') + '</div>';
    api(`/products/${productId}/interested-buyers`)
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (!rows.length) {
          listEl.innerHTML = '<div class="interested-buyers-empty">No interested buyers yet</div>';
          return;
        }
        listEl.innerHTML = rows.map((buyer) => {
          const name = [buyer.firstName, buyer.lastName].filter(Boolean).join(' ') || buyer.phoneNumber || buyer.userId;
          const onlineClass = buyer.isOnline ? 'interested-buyer-online' : '';
          const onlineText = buyer.isOnline ? t('online') : t('offline');
          const when = buyer.lastMessageAt ? formatDate(buyer.lastMessageAt) : '--';
          return `<div class="interested-buyer-item">
            <div class="interested-buyer-main">
              <div class="interested-buyer-name">${escapeHtml(name)}</div>
              <div class="interested-buyer-meta">
                <span>${escapeHtml(buyer.phoneNumber || '--')}</span>
                <span class="${onlineClass}">${escapeHtml(onlineText)}</span>
                <span>Last message: ${escapeHtml(when)}</span>
              </div>
            </div>
            <button type="button" class="btn secondary small interested-open-chat" data-conversation-id="${escapeHtml(buyer.conversationId)}">${escapeHtml(t('open_chat'))}</button>
          </div>`;
        }).join('');

        listEl.querySelectorAll('.interested-open-chat').forEach((btn) => {
          btn.addEventListener('click', () => {
            const conversationId = btn.getAttribute('data-conversation-id');
            if (!conversationId) return;
            openConversationById(conversationId)
              .catch((err) => {
                showToast(err.message || 'Failed to open chat', 'error');
              });
          });
        });
      })
      .catch((err) => {
        listEl.innerHTML = '<div class="interested-buyers-empty">' + escapeHtml(err.message || 'Failed to load buyers') + '</div>';
      });
  }

  window._refreshProductDetailAuctionBids = function (auctionId) {
    const container = $('product-detail-auction-bids');
    if (!container || container.getAttribute('data-auction-id') !== auctionId) return;
    const currency = currentProductDetail?.currency || 'UZS';
    const isEnded = currentProductDetail?.activeAuction?.status !== 'ACTIVE';
    api(`/bids?auctionId=${auctionId}&view=top&limit=20`).then((res) => {
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      const sorted = [...list].sort((x, y) => Number(y.amount) - Number(x.amount));
      const top = sorted.slice(0, 10);
      if (container.getAttribute('data-auction-id') !== auctionId) return;
      if (top.length === 0) container.innerHTML = '<p class="auction-modal-hint">' + t('no_bids') + '</p>';
      else container.innerHTML = top.map((b, i) => {
        const showWinner = isEnded && i === 0;
        const showLeading = !isEnded && (b.isWinning || i === 0);
        return getBidRowHtml(b, currency, { showWinnerBadge: showWinner, showLeadingBadge: showLeading });
      }).join('');
    }).catch(() => {});
  };

  window._goToAuction = function (auctionId) {
    switchTab('auctions');
    setTimeout(() => showAuctionDetail(auctionId), 100);
  };

  let currentAuctionModalAuctionId = null;
  let currentAuctionModalProduct = null;

  window._openAuctionModal = function (auctionId, product) {
    if (!auctionId || !product) return;
    currentAuctionModalAuctionId = auctionId;
    currentAuctionModalProduct = product;
    connectAuctionSocket(auctionId);
    const overlay = $('auction-modal-overlay');
    const productEl = $('auction-modal-product');
    const bidsEl = $('auction-modal-bids');
    const myBidEl = $('auction-modal-my-bid');
    const amountInput = $('auction-modal-bid-amount');
    const minHint = $('auction-modal-min-hint');
    productEl.innerHTML = escapeHtml(product.title || '') + ' — ' + formatPrice(product.activeAuction?.currentPrice ?? product.price, product.currency);
    bidsEl.innerHTML = '<div class="loading-state">' + t('loading') + '</div>';
    myBidEl.innerHTML = '';
    myBidEl.classList.add('empty');
    amountInput.value = '';
    minHint.textContent = '';
    show(overlay);

    function renderBids(auction, bidsList) {
      const list = Array.isArray(bidsList) ? bidsList : (bidsList?.data ?? []);
      const sorted = [...list].sort((x, y) => Number(y.amount) - Number(x.amount));
      const top = sorted.slice(0, 10);
      const currency = currentAuctionModalProduct?.currency || 'UZS';
      const isEnded = auction && auction.status !== 'ACTIVE';
      bidsEl.innerHTML = top.length === 0
        ? '<p class="auction-modal-hint">' + t('no_bids') + '</p>'
        : top.map((b, i) => {
            const showWinner = isEnded && i === 0;
            const showLeading = !isEnded && (b.isWinning || i === 0);
            return getBidRowHtml(b, currency, { showWinnerBadge: showWinner, showLeadingBadge: showLeading, rowClass: 'auction-modal-bid-row' });
          }).join('');
      const myBid = list.find((b) => b.bidderId === currentUser?.id);
      if (myBid && myBidEl) {
        myBidEl.classList.remove('empty');
        myBidEl.innerHTML = t('my_bid') + ': ' + formatPrice(myBid.amount, currentAuctionModalProduct?.currency || 'UZS');
      } else if (myBidEl) {
        myBidEl.classList.add('empty');
      }
      const minAmount = Number(auction.currentPrice) + Number(auction.bidIncrement || 0);
      if (minHint) minHint.textContent = t('min_bid_hint').replace('{amount}', formatPrice(minAmount, currentAuctionModalProduct?.currency || 'UZS'));
      if (amountInput) amountInput.placeholder = t('min_bid_hint').replace('{amount}', formatPrice(minAmount, currentAuctionModalProduct?.currency || 'UZS'));
      window._auctionModalMinAmount = minAmount;
    }

    Promise.all([
      api('/auctions/' + auctionId),
      api(`/bids?auctionId=${auctionId}&view=all&limit=50`).catch(() => []),
    ]).then(([auction, bids]) => {
      renderBids(auction, bids);
      window._auctionModalAuction = auction;
      window._auctionModalRenderBids = renderBids;
      if (auction?.status === 'ACTIVE') startAuctionTimer(auction);
    }).catch((err) => {
      bidsEl.innerHTML = '<p class="error">' + escapeHtml(err.message) + '</p>';
      showToast(err.message, 'error');
    });
  };

  window._refreshAuctionModalBids = function () {
    if (!currentAuctionModalAuctionId || !window._auctionModalRenderBids) return;
    const bidsEl = $('auction-modal-bids');
    if (!bidsEl) return;
    Promise.all([
      api('/auctions/' + currentAuctionModalAuctionId),
      api(`/bids?auctionId=${currentAuctionModalAuctionId}&view=all&limit=50`).catch(() => []),
    ]).then(([auction, bids]) => {
      if (currentAuctionModalAuctionId !== auction?.id) return;
      window._auctionModalRenderBids(auction, bids);
    });
  };

  function closeAuctionModal() {
    currentAuctionModalAuctionId = null;
    currentAuctionModalProduct = null;
    const modalTimerEl = $('auction-modal-timer');
    if (modalTimerEl) modalTimerEl.textContent = '';
    hide($('auction-modal-overlay'));
  }

  $('auction-modal-close')?.addEventListener('click', closeAuctionModal);
  $('auction-modal-overlay')?.addEventListener('click', (e) => { if (e.target.id === 'auction-modal-overlay') closeAuctionModal(); });
  $('auction-modal-place-bid')?.addEventListener('click', () => {
    const amount = parseFloat($('auction-modal-bid-amount').value);
    const minAmount = window._auctionModalMinAmount;
    if (!currentAuctionModalAuctionId || !currentUser) return;
    if (isNaN(amount) || amount < (minAmount || 0)) {
      showToast(t('enter_valid_bid'), 'error');
      return;
    }
    $('auction-modal-place-bid').disabled = true;
    api('/bids', { method: 'POST', body: JSON.stringify({ auctionId: currentAuctionModalAuctionId, amount }) })
      .then(() => {
        showToast(t('bid_placed'), 'success');
        window._openAuctionModal(currentAuctionModalAuctionId, currentAuctionModalProduct);
      })
      .catch((err) => { showToast(err.message, 'error'); })
      .finally(() => { $('auction-modal-place-bid').disabled = false; });
  });

  window._deleteProduct = function (id) {
    if (!confirm(t('confirm_delete'))) return;
    api(`/products/${id}`, { method: 'DELETE' })
      .then(() => { showToast(t('product_deleted'), 'success'); hideProductDetail(); loadProducts(); })
      .catch((err) => showToast(err.message, 'error'));
  };

  function hideProductDetail() {
    hide($('product-detail-view'));
    show($('products-list-view'));
    currentProductDetail = null;
    clearInterval(auctionTimerInterval);
    auctionTimerInterval = null;
    currentAuctionEndTime = null;
  }
  function showProductCreateForm() {
    hide($('products-list-view'));
    show($('product-create-view'));
    loadFormDropdowns();
    pcUploadedImages = [];
    renderProductCreateImagePreviews();
    setProductCreateLocationCityPlaceholder(true);
    setProductCreateLocationDistrictPlaceholder(true);
    const pin = $('pc-images');
    if (pin) pin.value = '';
  }
  function hideProductCreateForm() { hide($('product-create-view')); show($('products-list-view')); }

  window._editProduct = function () {
    if (!currentProductDetail) return;
    showProductEditForm(currentProductDetail);
  };

  function showProductEditForm(product) {
    hide($('product-detail-view'));
    show($('product-edit-view'));
    $('pe-product-id').value = product.id;
    const titleVal = typeof product.title === 'object' ? (product.title.en || product.title.uz || product.title.ru || (product.title && Object.values(product.title)[0])) : (product.title || '');
    const descVal = typeof product.description === 'object' ? (product.description?.en || product.description?.uz || product.description?.ru || (product.description && Object.values(product.description)[0])) : (product.description || '');
    $('pe-title').value = titleVal;
    $('pe-description').value = descVal || '';
    $('pe-price').value = product.price ?? '';
    $('pe-currency').value = product.currency || 'UZS';
    $('pe-tags').value = (product.tags || []).join(', ');
    $('pe-region').value = product.region || '';
    $('pe-city').value = product.city || '';
    const imagesEl = $('product-edit-images');
    if (product.images && product.images.length > 0) {
      imagesEl.innerHTML = `<label>${t('existing_images')}</label><div class="product-edit-images-list" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.35rem">${product.images.map((img) => `<img src="${escapeHtml(img.url)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:6px" />`).join('')}</div>`;
      imagesEl.classList.remove('hidden');
    } else {
      imagesEl.innerHTML = '';
      imagesEl.classList.add('hidden');
    }
    loadEditFormDropdowns(product);
  }

  function hideProductEditForm() {
    hide($('product-edit-view'));
    show($('products-list-view'));
    currentProductDetail = null;
  }

  function loadEditFormDropdowns(product) {
    if (categoriesCache.length === 0) {
      api('/categories?limit=100').then((res) => {
        categoriesCache = res.data || res || [];
        fillSelect('pe-category', categoriesCache, 'id', 'name');
        $('pe-category').value = product.categoryId || '';
      }).catch(() => {});
    } else {
      fillSelect('pe-category', categoriesCache, 'id', 'name');
      $('pe-category').value = product.categoryId || '';
    }
    if (conditionsCache.length === 0) {
      api('/conditions?limit=100').then((res) => {
        conditionsCache = res.data || res || [];
        fillSelect('pe-condition', conditionsCache, 'id', 'name');
        $('pe-condition').value = product.condition?.id || '';
      }).catch(() => {});
    } else {
      fillSelect('pe-condition', conditionsCache, 'id', 'name');
      $('pe-condition').value = product.condition?.id || '';
    }
    if (sizesCache.length === 0) {
      api('/sizes?limit=100').then((res) => {
        sizesCache = res.data || res || [];
        fillSelect('pe-size', sizesCache, 'id', 'name');
        $('pe-size').value = product.size?.id || '';
      }).catch(() => {});
    } else {
      fillSelect('pe-size', sizesCache, 'id', 'name');
      $('pe-size').value = product.size?.id || '';
    }
  }

  function onUpdateProduct(e) {
    e.preventDefault();
    const id = $('pe-product-id').value;
    if (!id) return;
    const title = $('pe-title').value.trim();
    const description = $('pe-description').value.trim();
    const price = parseFloat($('pe-price').value) || undefined;
    const currency = $('pe-currency').value;
    const categoryId = $('pe-category').value;
    const conditionId = $('pe-condition').value;
    const sizeId = $('pe-size').value;
    const tags = $('pe-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
    const region = $('pe-region').value.trim() || undefined;
    const city = $('pe-city').value.trim() || undefined;

    if (!categoryId || !conditionId || !sizeId) { showToast(t('fill_required_fields'), 'error'); return; }

    const body = {
      categoryId,
      conditionId,
      sizeId,
      currency,
    };
    if (title) body.title = { en: title };
    if (description) body.description = { en: description };
    if (price !== undefined) body.price = price;
    if (tags.length > 0) body.tags = tags;
    if (region) body.region = region;
    if (city) body.city = city;

    if (currentProductDetail && currentProductDetail.images && currentProductDetail.images.length > 0) {
      body.imageIds = currentProductDetail.images.map((img) => img.id);
    }

    api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      .then(() => {
        showToast(t('product_updated'), 'success');
        hideProductEditForm();
        loadProducts();
      })
      .catch((err) => showToast(err.message, 'error'));
  }

  let pcUploadedImages = [];
  const MAX_PRODUCT_IMAGES = 10;

  function loadFormDropdowns() {
    if (categoriesCache.length === 0) {
      api('/categories?limit=100').then((res) => { categoriesCache = res.data || res || []; fillSelect('pc-category', categoriesCache, 'id', 'name'); }).catch(() => {});
    } else { fillSelect('pc-category', categoriesCache, 'id', 'name'); }
    if (conditionsCache.length === 0) {
      api('/conditions?limit=100').then((res) => { conditionsCache = res.data || res || []; fillSelect('pc-condition', conditionsCache, 'id', 'name'); }).catch(() => {});
    } else { fillSelect('pc-condition', conditionsCache, 'id', 'name'); }
    if (sizesCache.length === 0) {
      api('/sizes?limit=100').then((res) => { sizesCache = res.data || res || []; fillSelect('pc-size', sizesCache, 'id', 'name'); }).catch(() => {});
    } else { fillSelect('pc-size', sizesCache, 'id', 'name'); }
    api('/locations/regions').then((res) => {
      const list = Array.isArray(res) ? res : (res?.data || []) || [];
      fillSelect('pc-region', list, 'id', 'name');
    }).catch(() => { fillSelect('pc-region', [], 'id', 'name'); });
  }

  function setProductCreateLocationCityPlaceholder(disabled) {
    const sel = $('pc-city');
    sel.innerHTML = '<option value="">' + (disabled ? '-- Select region first --' : '-- Select --') + '</option>';
    sel.disabled = !!disabled;
  }

  function setProductCreateLocationDistrictPlaceholder(disabled) {
    const sel = $('pc-district');
    sel.innerHTML = '<option value="">' + (disabled ? '-- Select city first --' : '-- Select --') + '</option>';
    sel.disabled = !!disabled;
  }

  function renderProductCreateImagePreviews() {
    const container = $('pc-image-previews');
    if (!container) return;
    container.innerHTML = '';
    pcUploadedImages.forEach((item, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'image-preview-item';
      wrap.innerHTML = '<img src="' + escapeHtml(item.url || '') + '" alt="" /><button type="button" class="btn-remove-preview" data-index="' + index + '" aria-label="Remove">&times;</button>';
      wrap.querySelector('.btn-remove-preview').addEventListener('click', () => {
        pcUploadedImages.splice(index, 1);
        renderProductCreateImagePreviews();
      });
      container.appendChild(wrap);
    });
  }

  async function uploadProductImage(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await api('/files/upload', { method: 'POST', body: form });
    const id = res?.id || res;
    const url = res?.url || '';
    if (id) pcUploadedImages.push({ id, url });
    return id;
  }

  function resolveLabel(item, labelKey) {
    const v = item[labelKey];
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') return v.en || v.ru || v.uz || Object.values(v)[0] || '';
    return '';
  }

  function fillSelect(selectId, items, valueKey, labelKey) {
    const sel = $(selectId);
    sel.innerHTML = '<option value="">-- Select --</option>';
    items.forEach((item) => { const opt = document.createElement('option'); opt.value = item[valueKey]; opt.textContent = resolveLabel(item, labelKey); sel.appendChild(opt); });
  }

  function onCreateProduct(e) {
    e.preventDefault();
    const title = $('pc-title').value.trim();
    const description = $('pc-description').value.trim();
    const price = parseFloat($('pc-price').value) || undefined;
    const currency = $('pc-currency').value;
    const categoryId = $('pc-category').value;
    const conditionId = $('pc-condition').value;
    const sizeId = $('pc-size').value;
    const tags = $('pc-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
    const regionId = $('pc-region').value || undefined;
    const cityId = $('pc-city').value || undefined;
    const districtId = $('pc-district').value || undefined;
    const createAuction = $('pc-create-auction').checked;

    if (!categoryId || !conditionId || !sizeId) { showToast(t('fill_required_fields'), 'error'); return; }

    const body = {
      categoryId,
      conditionId,
      sizeId,
      currency,
    };
    if (title) body.title = { en: title };
    if (description) body.description = { en: description };
    if (price) body.price = price;
    if (tags.length > 0) body.tags = tags;
    if (regionId) body.regionId = regionId;
    if (cityId) body.cityId = cityId;
    if (districtId) body.districtId = districtId;
    if (pcUploadedImages.length > 0) body.imageIds = pcUploadedImages.map((x) => x.id);

    if (createAuction) {
      body.createAuction = true;
      const startPrice = parseFloat($('pc-auction-start-price').value) || price;
      const durationHours = parseInt($('pc-auction-duration').value) || 2;
      const autoExtend = $('pc-auction-auto-extend').checked;
      body.auction = { startPrice, durationHours, autoExtend };
    }

    api('/products', { method: 'POST', body: JSON.stringify(body) })
      .then((product) => {
        const isPending = product && product.status === 'PENDING_MODERATION';
        showToast(isPending ? t('product_created_pending_moderation') : t('product_created'), 'success');
        hideProductCreateForm();
        $('product-create-form').reset();
        pcUploadedImages = [];
        renderProductCreateImagePreviews();
        loadProducts();
        if (product && product.id && isPending) {
          setTimeout(() => showProductDetail(product.id), 300);
        }
      })
      .catch((err) => showToast(err.message, 'error'));
  }

  function loadAuctions() {
    const status = $('auction-status-filter').value;
    hide($('auctions-empty'));
    show($('auctions-loading'));
    $('auctions-grid').innerHTML = '';
    const params = new URLSearchParams({ page: String(auctionsPage), limit: '12' });
    if (status) params.set('status', status);
    const url = `${API_BASE}${API_PREFIX}/auctions?${params}`;
    const headers = { 'Content-Type': 'application/json', 'Accept-Language': currentLang || 'en' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    fetch(url, { headers })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((err) => {
            const msg = err?.error?.message || err?.message || r.statusText;
            return Promise.reject(new Error(msg));
          });
        }
        return r.json();
      })
      .then((raw) => {
        hide($('auctions-loading'));
        const items = Array.isArray(raw.data) ? raw.data : raw.data ? [raw.data] : [];
        auctionsCache = items;
        const pagination = raw.meta?.pagination || raw.meta || {};
        const totalPagesFromMeta = pagination.totalPages;
        const totalPagesFallback =
          pagination.total != null
            ? Math.ceil(pagination.total / (pagination.limit || 12))
            : 1;
        auctionsTotalPages = (totalPagesFromMeta || totalPagesFallback || 1);
        renderAuctions(auctionsCache);
        updateAuctionsPagination();
      })
      .catch((err) => {
        hide($('auctions-loading'));
        showToast(err.message || 'Failed to load auctions', 'error');
        auctionsCache = [];
        auctionsTotalPages = 1;
        renderAuctions([]);
        updateAuctionsPagination();
      });
  }

  function renderAuctions(auctions) {
    const grid = $('auctions-grid');
    grid.innerHTML = '';
    if (auctions.length === 0) { show($('auctions-empty')); return; }
    hide($('auctions-empty'));
    auctions.forEach((a) => {
      const card = document.createElement('div'); card.className = 'card';
      const statusClass = a.status === 'ACTIVE' ? 'status-active' : 'status-ended';
      const isLive = a.status === 'ACTIVE';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
          <span class="card-status ${statusClass}">${isLive ? `<span class="live-dot"></span>${t('live')}` : a.status}</span>
          <span style="font-size:.8rem;color:#8b98a5">${a.totalBids || 0} ${t('bids')}</span>
        </div>
        <h3 class="card-title">${escapeHtml(a.product?.title || 'Auction')}</h3>
        <div class="card-meta"><span>${escapeHtml(a.creator?.firstName || '')} ${escapeHtml(a.creator?.lastName || '')}</span></div>
        <div class="card-price">${formatPrice(a.currentPrice, a.product?.currency)}</div>
        <div style="font-size:.85rem;color:${isLive ? '#eab308' : '#8b98a5'};margin-top:.35rem">
          ${isLive ? `${t('time_left')}: ${timeLeft(a.endTime)}` : `${t('ended')} ${formatDate(a.endTime)}`}
        </div>`;
      card.addEventListener('click', () => showAuctionDetail(a.id));
      grid.appendChild(card);
    });
  }

  function updateAuctionsPagination() {
    $('auctions-page-info').textContent = `Page ${auctionsPage} / ${auctionsTotalPages}`;
    $('auctions-prev').disabled = auctionsPage <= 1;
    $('auctions-next').disabled = auctionsPage >= auctionsTotalPages;
  }

  function showAuctionDetail(id) {
    hide($('auctions-list-view')); show($('auction-detail-view'));
    $('auction-detail-content').innerHTML = `<div class="loading-state">${t('loading')}</div>`;
    currentAuctionId = id;
    connectAuctionSocket(id);
    api(`/auctions/${id}?incrementViews=true`)
      .then((auction) => renderAuctionDetail(auction))
      .catch((err) => { $('auction-detail-content').innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`; });
  }

  function renderAuctionDetail(a) {
    currentAuctionCreatorId = a.creatorId || null;
    currentAuctionEnded = a.status !== 'ACTIVE';
    const isActive = a.status === 'ACTIVE';
    const statusClass = isActive ? 'status-active' : 'status-ended';
    const isWinner = currentUser?.id && a.winnerId && currentUser.id === a.winnerId;
    $('auction-detail-content').innerHTML = `
      <div class="auction-hero">
        <div class="auction-info-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
            <span class="card-status ${statusClass}">${isActive ? `<span class="live-dot"></span>${t('live')}` : a.status}</span>
            <div style="display:flex;align-items:center;gap:.5rem">
              <span id="auction-socket-status" class="ws-status disconnected">Connecting...</span>
              <span style="font-size:.8rem;color:#8b98a5">${a.totalBids || 0} ${t('total_bids')}</span>
            </div>
          </div>
          <h2 class="detail-title">${escapeHtml(a.product?.title || 'Auction')}</h2>
          <div class="auction-price-big" id="auction-current-price">${formatPrice(a.currentPrice, a.product?.currency)}</div>
          <div class="auction-timer ${!isActive ? 'ended' : ''}" id="auction-timer">
            ${isActive ? `${t('time_left')}: ${timeLeft(a.endTime)}` : t('auction_ended')}
          </div>
          <div class="detail-row"><span class="detail-label">${t('start_price')}</span><span class="detail-value">${formatPrice(a.startPrice, a.product?.currency)}</span></div>
          <div class="detail-row"><span class="detail-label">${t('bid_increment')}</span><span class="detail-value">${formatPrice(a.bidIncrement, a.product?.currency)}</span></div>
          <div class="detail-row"><span class="detail-label">${t('auto_extend')}</span><span class="detail-value">${a.autoExtend ? `${t('yes')} (${a.extendMinutes}min)` : t('no')}</span></div>
          ${a.winner ? `<div class="detail-row"><span class="detail-label">${t('winner')}</span><span class="detail-value" style="color:#22c55e">${escapeHtml([a.winner.firstName, a.winner.lastName].filter(Boolean).join(' ') || a.winner.phoneNumber || a.winnerId)}</span></div>` : ''}
          ${isActive ? `<div class="bid-form" id="bid-form"><input type="number" id="bid-amount-input" placeholder="${t('bid_amount')}" step="0.01" /><button class="btn success" id="btn-place-bid">${t('place_bid')}</button></div>` : ''}
          ${!isActive && isWinner ? `<div style="margin-top:1rem"><button type="button" class="btn primary" id="btn-create-order-open-chat">${t('order_create_and_chat')}</button></div>` : ''}
        </div>
        <div class="auction-info-card">
          <h4 style="margin:0 0 .75rem;color:#8b98a5;text-transform:uppercase;font-size:.85rem">${t('product_details')}</h4>
          <div class="detail-row"><span class="detail-label">${t('product_title')}</span><span class="detail-value">${escapeHtml(a.product?.title || '--')}</span></div>
          <div class="detail-row"><span class="detail-label">${t('product_price')}</span><span class="detail-value">${formatPrice(a.product?.price, a.product?.currency)}</span></div>
          <div class="detail-row"><span class="detail-label">${t('product_category')}</span><span class="detail-value">${escapeHtml(resolveLabel(a.product?.category || {}, 'name') || '--')}</span></div>
          <div class="detail-row"><span class="detail-label">${t('views')}</span><span class="detail-value">${a.views || 0}</span></div>
          <div class="detail-row"><span class="detail-label">${t('created')}</span><span class="detail-value">${formatDate(a.createdAt)}</span></div>
          ${a.product?.description ? `<div style="margin-top:.75rem;color:#8b98a5;font-size:.9rem">${escapeHtml(a.product.description)}</div>` : ''}
        </div>
      </div>
      <div class="section-tabs">
        <button class="section-tab active" data-section="bids">${t('bids')}</button>
        <button class="section-tab" data-section="leaderboard">${t('leaderboard')}</button>
        <button class="section-tab" data-section="my-bids">${t('my_bids')}</button>
      </div>
      <div id="auction-section-content" class="auction-info-card"><div class="loading-state">${t('loading')}</div></div>`;
    const bidBtn = $('btn-place-bid');
    if (bidBtn) bidBtn.addEventListener('click', () => placeBid(a.id));
    const createOrderBtn = $('btn-create-order-open-chat');
    if (createOrderBtn) createOrderBtn.addEventListener('click', () => {
      createOrderBtn.disabled = true;
      const amount = Number(a.currentPrice) || 0;
      api('/orders', { method: 'POST', body: JSON.stringify({ productId: a.productId, auctionId: a.id, amount }) })
        .then((order) => {
          showToast(t('order_create_and_chat') + ' ✓', 'success');
          switchTab('chat');
          window._openChatForOrder(order.id);
        })
        .catch((err) => { showToast(err.message || 'Failed to create order', 'error'); createOrderBtn.disabled = false; })
        .then(() => { if (createOrderBtn && !createOrderBtn.disabled) createOrderBtn.disabled = false; });
    });
    document.querySelectorAll('.section-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.section-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        loadAuctionSection(a.id, tab.dataset.section);
      });
    });
    startAuctionTimer(a);
    loadAuctionSection(a.id, 'bids');
  }

  let currentAuctionEndTime = null;

  function startAuctionTimer(auction) {
    clearInterval(auctionTimerInterval);
    if (!auction || auction.status !== 'ACTIVE' || !auction.endTime) return;
    const raw = auction.endTime;
    const endTime = (typeof raw === 'string' || typeof raw === 'number') ? new Date(raw) : (raw instanceof Date ? raw : new Date(raw));
    if (!(endTime instanceof Date) || typeof endTime.getTime !== 'function' || isNaN(endTime.getTime())) return;
    currentAuctionEndTime = endTime;
    function tick() {
      const left = timeLeft(currentAuctionEndTime);
      const text = `${t('time_left')}: ${left}`;
      const timerEl = $('auction-timer');
      if (timerEl) { timerEl.textContent = text; timerEl.classList.toggle('ended', left === t('ended')); }
      const modalTimerEl = $('auction-modal-timer');
      if (modalTimerEl) { modalTimerEl.textContent = text; modalTimerEl.classList.toggle('ended', left === t('ended')); }
      if (left === t('ended')) { clearInterval(auctionTimerInterval); currentAuctionEndTime = null; }
    }
    tick();
    auctionTimerInterval = setInterval(tick, 1000);
  }

  function loadAuctionSection(auctionId, section) {
    const container = $('auction-section-content');
    container.innerHTML = `<div class="loading-state">${t('loading')}</div>`;
    const isAuctionOwner = currentUser?.id && currentAuctionCreatorId && currentUser.id === currentAuctionCreatorId;
    if (section === 'bids') {
      const viewParam = auctionBidsView || 'all';
      const countsPromise = isAuctionOwner
        ? api(`/auctions/${auctionId}/bids/counts`).catch(() => null)
        : Promise.resolve(null);

      Promise.all([
        api(`/bids?auctionId=${auctionId}&limit=50&view=${viewParam}`),
        countsPromise,
      ])
        .then(([bids, counts]) => {

          if (bids.length === 0) {
            container.innerHTML = `<div class="empty-state">${t('no_bids')}</div>`;
            return;
          }

          const allCount = counts?.all ?? bids.length;
          const newCount = counts?.new ?? 0;
          const topCount = counts?.top ?? 0;
          const rejectedCount = counts?.rejected ?? 0;

          container.innerHTML =
            '<div class="bid-view-tabs" id="bid-view-tabs"></div><div class="bid-feed" id="bid-feed"></div>';
          const viewTabsEl = $('bid-view-tabs');
          if (viewTabsEl && isAuctionOwner) {
            viewTabsEl.innerHTML = `
            <button type="button" class="section-tab ${
              auctionBidsView === 'all' ? 'active' : ''
            }" data-bid-view="all">
              ${escapeHtml(t('bids_all'))} <span class="badge-count">${allCount}</span>
            </button>
            <button type="button" class="section-tab ${
              auctionBidsView === 'new' ? 'active' : ''
            }" data-bid-view="new">
              ${escapeHtml(t('bids_new'))} <span class="badge-count">${newCount}</span>
            </button>
            <button type="button" class="section-tab ${
              auctionBidsView === 'top' ? 'active' : ''
            }" data-bid-view="top">
              ${escapeHtml(t('bids_top'))} <span class="badge-count">${topCount}</span>
            </button>
            <button type="button" class="section-tab ${
              auctionBidsView === 'rejected' ? 'active' : ''
            }" data-bid-view="rejected">
              ${escapeHtml(t('bids_rejected'))} <span class="badge-count">${rejectedCount}</span>
            </button>
          `;
            viewTabsEl.querySelectorAll('button').forEach((btn) => {
              btn.addEventListener('click', () => {
                auctionBidsView = btn.dataset.bidView;
                document
                  .querySelectorAll('#bid-view-tabs .section-tab')
                  .forEach((t) =>
                    t.classList.toggle(
                      'active',
                      t.dataset.bidView === auctionBidsView,
                    ),
                  );
                loadAuctionSection(auctionId, 'bids');
              });
            });
          } else if (viewTabsEl) viewTabsEl.innerHTML = '';

          const feed = $('bid-feed');
          (Array.isArray(bids) ? bids : []).forEach((b) => {
            feed.appendChild(
              createBidItem(b, {
                showOwnerRemove: isAuctionOwner,
                showMarkRead: isAuctionOwner,
                showRestore: isAuctionOwner,
                showWinnerLabel: currentAuctionEnded,
              }),
            );
          });
        })
        .catch((err) => {
          container.innerHTML = `<div class="error">${escapeHtml(
            err.message,
          )}</div>`;
        });
    } else if (section === 'leaderboard') {
      api(`/auctions/${auctionId}/leaderboard?limit=20`).then((res) => {
        const entries = res.leaderboard || res.data || res || [];
        if (entries.length === 0) { container.innerHTML = `<div class="empty-state">${t('no_bids')}</div>`; return; }
        container.innerHTML = '';
        entries.forEach((entry, i) => {
          const rank = i + 1;
          const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
          const div = document.createElement('div'); div.className = 'leaderboard-item';
          const userName = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || entry.phoneNumber || entry.bidderId || 'User';
          div.innerHTML = `<span class="leaderboard-rank ${rankClass}">#${rank}</span><div style="flex:1"><div style="font-weight:500">${escapeHtml(userName)}</div><div style="font-size:.8rem;color:#8b98a5">${entry.totalBids || entry.bidCount || 0} ${t('bids')}</div></div><div style="font-weight:700;color:#22c55e">${formatPrice(entry.highestBid || entry.amount, 'UZS')}</div>`;
          container.appendChild(div);
        });
      }).catch((err) => { container.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`; });
    } else if (section === 'my-bids') {
      api(`/bids/my-bids?auctionId=${auctionId}&limit=50`).then((res) => {
        const bids = res.data || res || [];
        if (bids.length === 0) { container.innerHTML = `<div class="empty-state">${t('no_bids')}</div>`; return; }
        container.innerHTML = '<div class="bid-feed"></div>';
        const feed = container.querySelector('.bid-feed');
        (Array.isArray(bids) ? bids : []).forEach((b) => { feed.appendChild(createBidItem(b, { showRetract: true })); });
      }).catch((err) => { container.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`; });
    }
  }

  function createBidItem(bid, opts = {}) {
    const { showRetract = false, showOwnerRemove = false, showMarkRead = false, showRestore = false, showWinnerLabel = false } = typeof opts === 'boolean' ? { showRetract: opts } : opts;
    const div = document.createElement('div');
    div.className = `bid-item ${bid.isWinning ? 'winning' : ''} ${bid.isRetracted ? 'retracted' : ''} ${bid.isNew ? 'is-new' : ''}`;
    const userName = bid.bidder ? ([bid.bidder.firstName, bid.bidder.lastName].filter(Boolean).join(' ') || bid.bidder.phoneNumber || 'User') : 'User';
    const avatarUrl = bid.bidder?.avatarUrl || null;
    const initials = userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const isRejected = !!bid.rejectedAt;
    const statusTag = bid.isRetracted
      ? (isRejected
        ? `<span class="bid-status-tag rejected">${t('rejected')}</span>`
        : '<span class="bid-status-tag retracted">Retracted</span>')
      : '';
    const winLabel = showWinnerLabel && bid.isWinning ? t('winner') : t('winning');
    const winTag = bid.isWinning ? `<span class="bid-status-tag winning">${winLabel}</span>` : '';
    const newTag = bid.isNew ? '<span class="bid-status-tag new">New</span>' : '';
    let actionBtn = '';
    if (!bid.isRetracted) {
      if (showRetract) actionBtn = `<button class="bid-action-btn retract" onclick="event.stopPropagation();window._retractBid('${bid.id}','retract')" title="${t('retract')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
      else if (showOwnerRemove) actionBtn = `<button class="bid-action-btn remove" onclick="event.stopPropagation();window._retractBid('${bid.id}','remove')" title="${t('remove_bid')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`;
    }
    if (showMarkRead && bid.isNew && !isRejected) actionBtn += `<button class="bid-action-btn read" onclick="event.stopPropagation();window._markBidRead('${bid.id}')" title="Mark read">✓</button>`;
    if (showRestore && isRejected) actionBtn += `<button class="bid-action-btn restore" onclick="event.stopPropagation();window._restoreBid('${bid.id}')" title="Restore">↩</button>`;
    div.innerHTML = `
      <div class="bid-avatar">
        ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" />` : `<span class="bid-avatar-initials">${escapeHtml(initials)}</span>`}
      </div>
      <div class="bid-content">
        <div class="bid-top-row">
          <span class="bid-user">${escapeHtml(userName)}</span>
          <span class="bid-dot">&bull;</span>
          <span class="bid-time">${timeAgo(bid.createdAt)}</span>
          ${newTag}${winTag}${statusTag}
        </div>
        <div class="bid-price-row">
          <span class="bid-amount">${formatPrice(bid.amount)}</span>
        </div>
      </div>
      ${actionBtn}`;
    return div;
  }

  window._retractBid = function (bidId, action) {
    if (!confirm(t('confirm_delete'))) return;
    const isOwnerRemove = action === 'remove';
    api(`/bids/${bidId}`, { method: 'DELETE' })
      .then(() => {
        showToast(isOwnerRemove ? t('bid_removed') : t('bid_retracted'), 'success');
        if (currentAuctionId) {
          const activeSection = document.querySelector('.section-tab.active');
          loadAuctionSection(currentAuctionId, activeSection?.dataset?.section || 'bids');
          api(`/auctions/${currentAuctionId}`).then((a) => { const priceEl = $('auction-current-price'); if (priceEl) priceEl.textContent = formatPrice(a.currentPrice, a.product?.currency); });
        }
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  window._markBidRead = function (bidId) {
    api(`/bids/${bidId}/read`, { method: 'PATCH' })
      .then(() => {
        showToast('Bid marked as read', 'success');
        if (currentAuctionId) loadAuctionSection(currentAuctionId, 'bids');
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  window._restoreBid = function (bidId) {
    api(`/bids/${bidId}/restore`, { method: 'PATCH' })
      .then(() => {
        showToast('Bid restored', 'success');
        if (currentAuctionId) {
          loadAuctionSection(currentAuctionId, 'bids');
          api(`/auctions/${currentAuctionId}`).then((a) => { const priceEl = $('auction-current-price'); if (priceEl) priceEl.textContent = formatPrice(a.currentPrice, a.product?.currency); });
        }
      })
      .catch((err) => showToast(err.message, 'error'));
  };

  function placeBid(auctionId) {
    const input = $('bid-amount-input');
    const amount = parseFloat(input.value);
    if (!amount || amount <= 0) { showToast(t('enter_valid_bid'), 'error'); return; }
    $('btn-place-bid').disabled = true;
    api('/bids', { method: 'POST', body: JSON.stringify({ auctionId, amount }) })
      .then(() => {
        showToast(t('bid_placed'), 'success');
        input.value = '';
        api(`/auctions/${auctionId}`).then((a) => { const priceEl = $('auction-current-price'); if (priceEl) priceEl.textContent = formatPrice(a.currentPrice, a.product?.currency); });
        const activeSection = document.querySelector('.section-tab.active');
        if (activeSection) loadAuctionSection(auctionId, activeSection.dataset.section);
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => { $('btn-place-bid').disabled = false; });
  }

  function hideAuctionDetail() {
    hide($('auction-detail-view')); show($('auctions-list-view'));
    clearInterval(auctionTimerInterval);
    if (auctionSocket) {
      if (currentAuctionId) auctionSocket.emit('leave_auction', { auctionId: currentAuctionId });
      auctionSocket.removeAllListeners(); auctionSocket.disconnect(); auctionSocket = null;
    }
    currentAuctionId = null;
    currentAuctionCreatorId = null;
    currentAuctionEnded = false;
  }

  function connectAuctionSocket(auctionId) {
    if (auctionSocket) { auctionSocket.removeAllListeners(); auctionSocket.disconnect(); auctionSocket = null; }
    if (!accessToken) return;

    const base = API_BASE.replace(/\/$/, '');
    auctionSocket = window.io(`${base}/auction`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000,
    });

    auctionSocket.on('connect', () => {
      updateAuctionSocketStatus('connected');
      auctionSocket.emit('join_auction', { auctionId }, (response) => {
        if (!response?.success) showToast(t('failed_join_auction') + ': ' + (response?.error || ''), 'error');
      });
    });
    auctionSocket.on('disconnect', () => { updateAuctionSocketStatus('disconnected'); });
    auctionSocket.on('connect_error', () => { updateAuctionSocketStatus('disconnected'); });
    auctionSocket.on('connected', () => { updateAuctionSocketStatus('connected'); });

    auctionSocket.on('new_bid', (data) => {
      const bidderName = data.bid?.bidder ? ([data.bid.bidder.firstName, data.bid.bidder.lastName].filter(Boolean).join(' ') || data.bid.bidder.phoneNumber || t('someone')) : t('someone');
      showToast(t('new_bid_by').replace('{name}', bidderName).replace('{amount}', formatPrice(data.bid?.amount)), 'info');
      const priceEl = $('auction-current-price');
      if (priceEl && data.bid) priceEl.textContent = formatPrice(data.bid.amount);
      const feed = $('bid-feed');
      if (feed && data.bid) feed.prepend(createBidItem(data.bid));
      if (currentAuctionModalAuctionId === data.auctionId) window._refreshAuctionModalBids();
      if (currentProductDetail?.activeAuction?.id === data.auctionId) window._refreshProductDetailAuctionBids(data.auctionId);
    });
    auctionSocket.on('bid_replaced', (data) => {
      showToast(t('new_bid_by').replace('{name}', data.newBid?.bidder ? ([data.newBid.bidder.firstName, data.newBid.bidder.lastName].filter(Boolean).join(' ') || data.newBid.bidder.phoneNumber || t('someone')) : t('someone')).replace('{amount}', formatPrice(data.newBid?.amount)), 'info');
      const priceEl = $('auction-current-price');
      if (priceEl && data.newBid) priceEl.textContent = formatPrice(data.newBid.amount);
      if (currentAuctionId === data.auctionId) loadAuctionSection(currentAuctionId, 'bids');
      if (currentAuctionModalAuctionId === data.auctionId) window._refreshAuctionModalBids();
      if (currentProductDetail?.activeAuction?.id === data.auctionId) window._refreshProductDetailAuctionBids(data.auctionId);
    });
    auctionSocket.on('outbid', () => { showToast(t('you_have_been_outbid'), 'error'); });
    auctionSocket.on('bid_rejected', (data) => {
      const isMine = data.bid?.bidderId === currentUser?.id;
      if (isMine) {
        showToast(t('bid_removed'), 'error');
      }
      if (currentAuctionId === data.auctionId) {
        const priceEl = $('auction-current-price');
        if (priceEl) api(`/auctions/${currentAuctionId}`).then((a) => { priceEl.textContent = formatPrice(a.currentPrice, a.product?.currency); });
        const activeSection = document.querySelector('.section-tab.active');
        loadAuctionSection(currentAuctionId, activeSection?.dataset?.section || 'bids');
      }
    });
    auctionSocket.on('auction_updated', (data) => { showToast(t('auction_updated_price').replace('{amount}', formatPrice(data.auction?.currentPrice)), 'info'); if (data.auction) { const priceEl = $('auction-current-price'); if (priceEl) priceEl.textContent = formatPrice(data.auction.currentPrice); } });
    auctionSocket.on('auction_ended', (data) => { showToast(t('auction_ended'), 'info'); clearInterval(auctionTimerInterval); auctionTimerInterval = null; currentAuctionEndTime = null; const timerEl = $('auction-timer'); if (timerEl) { timerEl.textContent = t('auction_ended'); timerEl.classList.add('ended'); } const modalTimerEl = $('auction-modal-timer'); if (modalTimerEl) { modalTimerEl.textContent = t('auction_ended'); modalTimerEl.classList.add('ended'); } });
    auctionSocket.on('auction_extended', (data) => { showToast(t('auction_extended_to').replace('{time}', formatDate(data.newEndTime)), 'info'); if (data.newEndTime) startAuctionTimer({ status: 'ACTIVE', endTime: data.newEndTime }); });
    auctionSocket.on('ping', () => { if (auctionSocket?.connected) auctionSocket.emit('pong', { timestamp: Date.now() }); });
    auctionSocket.on('error', (err) => { showToast(t('socket_error') + ': ' + (err?.message || err), 'error'); });
  }

  function updateAuctionSocketStatus(status) {
    const el = $('auction-socket-status');
    if (!el) return;
    el.textContent = status === 'connected' ? 'Live' : 'Offline';
    el.className = 'ws-status ' + (status === 'connected' ? 'connected' : 'disconnected');
  }

  const CONVERSATION_EVENTS = {
    JOIN_CONVERSATION: 'join_conversation', LEAVE_CONVERSATION: 'leave_conversation',
    SEND_MESSAGE: 'send_message', TYPING_START: 'typing_start', TYPING_STOP: 'typing_stop',
    MARK_READ: 'mark_read', CONNECTED: 'connected', NEW_MESSAGE: 'new_message',
    MESSAGE_DELETED: 'message_deleted', MESSAGE_EDITED: 'message_edited',
    USER_TYPING: 'user_typing', MESSAGES_READ: 'messages_read',
    DELETE_MESSAGE: 'delete_message', EDIT_MESSAGE: 'edit_message',
  };

  function connectConversationSocket() {
    if (conversationSocket?.connected) return;
    if (!accessToken) return;
    const base = API_BASE.replace(/\/$/, '');
    conversationSocket = window.io(`${base}/conversation`, { auth: { token: accessToken }, transports: ['websocket', 'polling'] });

    conversationSocket.on('connect', () => { updateWsStatus('connected'); if (currentTab === 'chat') loadConversations(); });
    conversationSocket.on('disconnect', () => { updateWsStatus('disconnected'); });
    conversationSocket.on('connect_error', () => { updateWsStatus('disconnected'); });
    conversationSocket.on(CONVERSATION_EVENTS.CONNECTED, () => { updateWsStatus('connected'); requestOnlineStatuses(); });
    conversationSocket.on('user_presence', (data) => { if (data.isOnline) onlineUsers.add(data.userId); else onlineUsers.delete(data.userId); updatePresenceUI(); });

    conversationSocket.on(CONVERSATION_EVENTS.NEW_MESSAGE, (message) => {
      const senderName = message.sender ? ([message.sender.firstName, message.sender.lastName].filter(Boolean).join(' ') || message.sender.phoneNumber || '') : '';
      const preview = (message.content || '').slice(0, 50);
      showToast(t('new_message_from').replace('{name}', senderName).replace('{text}', preview), 'info');
      if (message.conversationId === currentConversationId) appendMessage(message);
      if (currentTab === 'chat') loadConversations();
      loadNotificationCount();
    });

    conversationSocket.on(CONVERSATION_EVENTS.MESSAGE_DELETED, (data) => {
      showToast(t('message_deleted'), 'info');
      if (data.conversationId === currentConversationId) { const el = document.querySelector(`[data-message-id="${data.messageId}"]`); if (el) el.remove(); }
    });

    conversationSocket.on(CONVERSATION_EVENTS.MESSAGE_EDITED, (message) => {
      showToast(t('message_edited'), 'info');
      if (message.conversationId === currentConversationId) {
        const el = document.querySelector(`[data-message-id="${message.id}"]`);
        if (el) { const contentEl = el.querySelector('.content'); if (contentEl) contentEl.textContent = message.content; if (!el.querySelector('.edited-tag')) { const tag = document.createElement('span'); tag.className = 'edited-tag'; tag.textContent = ' (edited)'; el.querySelector('.meta')?.prepend(tag); } }
      }
    });

    conversationSocket.on(CONVERSATION_EVENTS.USER_TYPING, (data) => { if (data.conversationId !== currentConversationId) return; const el = $('typing-indicator'); el.textContent = data.isTyping ? t('someone_typing') : ''; if (data.isTyping) show(el); else hide(el); });
    conversationSocket.on('ping', () => { conversationSocket.emit('pong', { timestamp: Date.now() }); });
  }

  function connectPaymentSocket() {
    if (paymentSocket?.connected) return;
    if (!accessToken) return;
    const base = API_BASE.replace(/\/$/, '');
    paymentSocket = window.io(base + '/payment', { auth: { token: accessToken }, transports: ['websocket', 'polling'] });
    paymentSocket.on('connect', () => {});
    paymentSocket.on('disconnect', () => {});
    paymentSocket.on('connect_error', () => {});
    paymentSocket.on('payment_success', (data) => {
      showToast(t('payment_success') + (data.amount ? ' — ' + formatPrice(data.amount, 'UZS') : ''), 'success');
      if (currentTab === 'orders') loadOrders();
      if (currentUser?.id) {
        api('/users/profile').then((user) => { if (user?.id) { currentUser = user; localStorage.setItem('sb_user', JSON.stringify(user)); } }).catch(() => {});
      }
    });
  }

  function updateWsStatus(status) { const el = $('ws-status'); if (!el) return; el.textContent = status === 'connected' ? 'Live' : 'Offline'; el.className = 'ws-status ' + (status === 'connected' ? 'connected' : 'disconnected'); }

  function requestOnlineStatuses() {
    if (!conversationSocket?.connected || conversationsCache.length === 0) return;
    const userIds = [];
    conversationsCache.forEach((c) => { const other = c.participants?.find((p) => p.userId !== currentUser?.id); if (other) userIds.push(other.userId); });
    if (userIds.length === 0) return;
    conversationSocket.emit('get_online_status', { userIds }, (res) => { if (res?.statuses) { Object.entries(res.statuses).forEach(([uid, isOnline]) => { if (isOnline) onlineUsers.add(uid); else onlineUsers.delete(uid); }); updatePresenceUI(); } });
  }

  function updatePresenceUI() {
    document.querySelectorAll('.conversation-list li').forEach((li) => {
      const cid = li.dataset.conversationId; const conv = conversationsCache.find((c) => c.id === cid); const other = conv?.participants?.find((p) => p.userId !== currentUser?.id); const dot = li.querySelector('.online-dot');
      if (other && onlineUsers.has(other.id)) { if (!dot) { const d = document.createElement('span'); d.className = 'online-dot'; li.querySelector('.conv-row')?.prepend(d); } } else if (dot) { dot.remove(); }
    });
    if (currentConversationId) { const conv = conversationsCache.find((c) => c.id === currentConversationId); const other = conv?.participants?.find((p) => p.userId !== currentUser?.id); const statusEl = $('conversation-status'); if (statusEl && other) { const isOnline = onlineUsers.has(other.userId); statusEl.textContent = isOnline ? t('online') : t('offline'); statusEl.className = 'conversation-status ' + (isOnline ? 'online' : 'offline'); } }
  }

  function loadConversations() {
    if (!accessToken) return;
    return api('/conversations?page=1&limit=50')
      .then((res) => { const list = res.data || res || []; conversationsCache = Array.isArray(list) ? list : []; renderConversationList(conversationsCache); requestOnlineStatuses(); return conversationsCache; })
      .catch((err) => { console.error('Load conversations:', err); conversationsCache = []; renderConversationList([]); });
  }

  async function openConversationById(conversationId) {
    if (!conversationId) return;
    const existing = conversationsCache.find((c) => c.id === conversationId);
    if (!existing) {
      const conversation = await api(`/conversations/${conversationId}`);
      if (conversation?.id) {
        conversationsCache = [conversation, ...conversationsCache.filter((c) => c.id !== conversation.id)];
      }
    }
    switchTab('chat');
    selectConversation(conversationId);
  }

  function getConversationDisplayName(c) {
    const other = c.participants?.find((p) => p.userId !== currentUser?.id);
    const name = [other?.firstName, other?.lastName].filter(Boolean).join(' ') || other?.username || other?.phoneNumber || 'Chat';
    if (c.pinnedOrder && (c.seller || c.buyer)) {
      const role = other?.role === 'seller' ? t('chat_role_seller') : other?.role === 'consumer' ? t('chat_role_consumer') : null;
      return role ? `${name} (${role})` : name;
    }
    return name;
  }

  function getConversationAvatarUrl(c) {
    const other = c.participants?.find((p) => p.userId !== currentUser?.id);
    return other?.avatarUrl && other.avatarUrl.trim() ? other.avatarUrl.trim() : '';
  }

  function renderConversationList(conversations) {
    const listEl = $('conversation-list'); const emptyEl = $('conversation-list-empty'); listEl.innerHTML = '';
    if (conversations.length === 0) { show(emptyEl); return; }
    hide(emptyEl);
    conversations.forEach((c) => {
      const name = getConversationDisplayName(c);
      const avatarUrl = getConversationAvatarUrl(c);
      const avatarHtml = avatarUrl
        ? '<img class="conv-avatar" src="' + escapeHtml(avatarUrl) + '" alt="" />'
        : '<span class="conv-avatar-placeholder">' + (name.charAt(0) || '?').toUpperCase() + '</span>';
      const preview = c.lastMessage?.content ? (c.lastMessage.content.slice(0, 40) + (c.lastMessage.content.length > 40 ? '...' : '')) : 'No messages yet';
      const unread = c.unreadCount || 0;
      const other = c.participants?.find((p) => p.userId !== currentUser?.id);
      const isOnline = other && onlineUsers.has(other.userId);
      const orderLabel = c.pinnedOrder ? ` · ${t('order_chat_label')} #${escapeHtml(c.pinnedOrder.orderNumber || c.pinnedOrder.id?.slice(0, 8) || '')}` : '';
      const flags = [
        c.blocked ? '<span class="conv-flag blocked">Blocked by you</span>' : '',
        c.isBlocked ? '<span class="conv-flag send-locked">Send locked</span>' : '',
      ].filter(Boolean).join('');
      const li = document.createElement('li'); li.dataset.conversationId = c.id;
      li.innerHTML = `<div class="conv-row"><div class="conv-avatar-wrap">${avatarHtml}</div>${isOnline ? '<span class="online-dot"></span>' : ''}<div class="conv-row-main"><strong>${escapeHtml(name)}</strong>${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}</div></div><div class="conv-preview">${escapeHtml(preview)}</div>${orderLabel ? `<div class="conv-order-label">${orderLabel}</div>` : ''}${flags ? `<div class="conv-flags">${flags}</div>` : ''}`;
      li.addEventListener('click', () => selectConversation(c.id));
      if (c.id === currentConversationId) li.classList.add('active');
      listEl.appendChild(li);
    });
  }

  function applyConversationSendLock(conv) {
    const input = $('message-input');
    const sendBtn = $('btn-send-message');
    if (!input || !sendBtn) return;

    let noteEl = $('chat-block-note');
    if (!noteEl) {
      noteEl = document.createElement('div');
      noteEl.id = 'chat-block-note';
      noteEl.className = 'chat-block-note hidden';
      const form = $('message-form');
      form?.parentNode?.insertBefore(noteEl, form);
    }

    if (!conv) {
      input.disabled = false;
      sendBtn.disabled = false;
      noteEl.textContent = '';
      noteEl.classList.add('hidden');
      return;
    }

    const isLocked = !!conv.isBlocked || !!conv.blocked;
    input.disabled = isLocked;
    sendBtn.disabled = isLocked;
    if (!isLocked) {
      noteEl.textContent = '';
      noteEl.classList.add('hidden');
      return;
    }

    const text = conv.isBlocked
      ? 'Messaging is locked for this conversation (conversation-level block).'
      : 'You blocked this user. Unblock to send messages.';
    noteEl.textContent = text;
    noteEl.classList.remove('hidden');
  }

  function selectConversation(conversationId) {
    if (currentConversationId && conversationSocket?.connected) conversationSocket.emit(CONVERSATION_EVENTS.LEAVE_CONVERSATION, { conversationId: currentConversationId });
    currentConversationId = conversationId;
    document.querySelectorAll('.conversation-list li').forEach((li) => { li.classList.toggle('active', li.dataset.conversationId === conversationId); });
    hide($('no-conversation')); show($('conversation-view'));
    if (conversationSocket?.connected) conversationSocket.emit(CONVERSATION_EVENTS.JOIN_CONVERSATION, { conversationId });
    const conv = conversationsCache.find((c) => c.id === conversationId);
    const other = conv ? conv.participants?.find((p) => p.userId !== currentUser?.id) : null;
    let title = other ? [other.firstName, other.lastName].filter(Boolean).join(' ') || other.username || other.phoneNumber : 'Chat';
    if (conv?.pinnedOrder && (conv.seller || conv.buyer)) {
      const sellerName = conv.seller ? [conv.seller.firstName, conv.seller.lastName].filter(Boolean).join(' ') || conv.seller.phoneNumber || '' : '';
      const buyerName = conv.buyer ? [conv.buyer.firstName, conv.buyer.lastName].filter(Boolean).join(' ') || conv.buyer.phoneNumber || '' : '';
      title = `${t('chat_role_seller')}: ${sellerName || '—'} · ${t('chat_role_consumer')}: ${buyerName || '—'}`;
    }
    $('conversation-title').textContent = title;
    const flowerEl = document.getElementById('conversation-flower');
    if (flowerEl) {
      let sub = '';
      if (conv?.pinnedOrder) sub = `${t('order_chat_label')} #${conv.pinnedOrder.orderNumber || conv.pinnedOrder.id?.slice(0, 8) || ''} · ${conv.pinnedOrder.status || ''}`;
      else if (conv?.flowerId || conv?.pinnedProduct) sub = 'About product';
      flowerEl.textContent = sub;
      flowerEl.style.display = sub ? 'block' : 'none';
    }
    const statusEl = $('conversation-status');
    if (statusEl && other) {
      const isOnline = onlineUsers.has(other.userId);
      statusEl.textContent = isOnline ? t('online') : t('offline');
      statusEl.className = 'conversation-status ' + (isOnline ? 'online' : 'offline');
      if (conv?.isBlocked) {
        statusEl.textContent = 'Send locked';
        statusEl.className = 'conversation-status locked';
      } else if (conv?.blocked) {
        statusEl.textContent = 'Blocked by you';
        statusEl.className = 'conversation-status warning';
      }
    }
    applyConversationSendLock(conv);
    renderChatOrderCard(conv);
    $('message-input')?.focus();
    $('messages-list').innerHTML = '';
    api(`/conversations/${conversationId}/messages?limit=50`)
      .then((res) => {
        const messages = res.data || res || [];
        (Array.isArray(messages) ? messages : []).forEach((m) => appendMessage(m, { noScroll: true }));
        scrollMessagesToBottom();
        if (messages.length > 0 && conversationSocket?.connected) conversationSocket.emit(CONVERSATION_EVENTS.MARK_READ, { conversationId }, () => { loadConversations(); });
      })
      .catch((err) => console.error('Load messages:', err));
  }

  function appendMessage(message, opts = {}) {
    if (message.isDeleted) return;
    const list = $('messages-list');
    if (list.querySelector(`[data-message-id="${message.id}"]`)) return;
    const isMine = message.sender?.id === currentUser?.id;
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${isMine ? 'mine' : 'theirs'}`;
    const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const senderName = !isMine && message.sender ? [message.sender.firstName, message.sender.lastName].filter(Boolean).join(' ') || message.sender.phoneNumber || '' : '';
    const senderAvatarUrl = !isMine && message.sender?.avatarUrl && message.sender.avatarUrl.trim() ? message.sender.avatarUrl.trim() : '';
    const senderAvatarHtml = senderAvatarUrl
      ? '<img class="message-sender-avatar" src="' + escapeHtml(senderAvatarUrl) + '" alt="" />'
      : '<span class="message-sender-avatar-placeholder">' + (senderName.charAt(0) || '?').toUpperCase() + '</span>';
    const edited = message.isEdited ? '<span class="edited-tag"> (edited)</span>' : '';
    const contentBlock = (senderName ? `<div class="sender-name">${escapeHtml(senderName)}</div>` : '') + `<div class="content">${escapeHtml(message.content || '')}</div>` + `<div class="meta">${edited}${time}</div>`;
    bubble.innerHTML = !isMine ? `<div class="message-sender-avatar-wrap">${senderAvatarHtml}</div><div class="message-bubble-body">${contentBlock}</div>` : `<div class="message-bubble-body">${contentBlock}</div>`;
    bubble.dataset.messageId = message.id;
    list.appendChild(bubble);
    if (opts.noScroll !== true) scrollMessagesToBottom();
  }

  function scrollMessagesToBottom() { const container = $('messages-container'); if (container) container.scrollTop = container.scrollHeight; }

  function onSendMessage(e) {
    e.preventDefault();
    const input = $('message-input'); const content = input.value.trim();
    if (!content || !currentConversationId) return;
    input.value = '';
    if (conversationSocket?.connected) {
      conversationSocket.emit(CONVERSATION_EVENTS.TYPING_STOP, { conversationId: currentConversationId });
      conversationSocket.emit(CONVERSATION_EVENTS.SEND_MESSAGE, { conversationId: currentConversationId, content }, (res) => { if (res?.error) showToast(res.error, 'error'); });
    }
  }

  function onMessageInput() {
    if (!currentConversationId || !conversationSocket?.connected) return;
    conversationSocket.emit(CONVERSATION_EVENTS.TYPING_START, { conversationId: currentConversationId });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => { conversationSocket.emit(CONVERSATION_EVENTS.TYPING_STOP, { conversationId: currentConversationId }); }, 2000);
  }

  let messageSearchTimeout = null;
  function runMessageSearch(q) {
    const resultsEl = $('chat-search-results');
    if (!resultsEl) return;
    const query = (q || '').trim();
    if (query.length < 2) { resultsEl.classList.add('hidden'); resultsEl.innerHTML = ''; return; }
    const params = new URLSearchParams({ q: query, limit: '20' });
    api('/conversations/messages/search?' + params)
      .then((res) => {
        const list = res.data || res || [];
        if (list.length === 0) { resultsEl.innerHTML = '<div class="chat-search-no-results">' + escapeHtml(t('search_no_results')) + '</div>'; show(resultsEl); return; }
        resultsEl.innerHTML = list.map((item) => {
          const msg = item.message || item;
          const convId = msg.conversationId;
          const title = item.conversationTitle || 'Chat';
          const snippet = (msg.content || '').slice(0, 80) + ((msg.content || '').length > 80 ? '...' : '');
          const dateStr = msg.createdAt ? new Date(msg.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '';
          return '<button type="button" class="chat-search-result-item" data-conversation-id="' + escapeHtml(convId) + '"><span class="chat-search-result-title">' + escapeHtml(title) + '</span><span class="chat-search-result-snippet">' + escapeHtml(snippet) + '</span><span class="chat-search-result-meta">' + escapeHtml(dateStr) + '</span></button>';
        }).join('');
        resultsEl.classList.remove('hidden');
        resultsEl.querySelectorAll('.chat-search-result-item').forEach((btn) => {
          btn.addEventListener('click', () => {
            const cid = btn.dataset.conversationId;
            if (cid) { selectConversation(cid); resultsEl.classList.add('hidden'); resultsEl.innerHTML = ''; const input = $('chat-message-search'); if (input) input.value = ''; }
          });
        });
      })
      .catch(() => { resultsEl.innerHTML = '<div class="chat-search-no-results">' + escapeHtml(t('search_no_results')) + '</div>'; resultsEl.classList.remove('hidden'); });
  }

  function hideMessageSearchResults() {
    const resultsEl = $('chat-search-results');
    if (resultsEl) { resultsEl.classList.add('hidden'); }
  }

  function onNewChat() {
    const form = $('new-chat-form');
    if (form.classList.contains('hidden')) { show(form); $('new-chat-search').value = ''; $('new-chat-message').value = ''; loadUserList(); $('new-chat-search').focus(); }
    else { hide(form); }
  }

  function loadUserList(search = '') {
    const listEl = $('user-list');
    listEl.innerHTML = `<div class="user-list-loading">${t('loading')}</div>`;
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (search) params.set('search', search);
    api(`/conversations/users?${params}`)
      .then((res) => {
        const users = res.data || res || []; listEl.innerHTML = '';
        if (users.length === 0) { listEl.innerHTML = '<div class="user-list-empty">No users found.</div>'; return; }
        users.forEach((u) => {
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.phoneNumber || u.id;
          const avatarUrl = u.avatarUrl && u.avatarUrl.trim() ? u.avatarUrl.trim() : '';
          const avatarHtml = avatarUrl
            ? '<img class="user-list-avatar" src="' + escapeHtml(avatarUrl) + '" alt="" />'
            : '<span class="user-list-avatar-placeholder">' + (name.charAt(0) || '?').toUpperCase() + '</span>';
          const item = document.createElement('button'); item.type = 'button'; item.className = 'user-list-item';
          item.innerHTML = `<span class="user-list-avatar-wrap">${avatarHtml}</span><span class="user-list-item-text"><strong>${escapeHtml(name)}</strong><span class="user-list-meta">${escapeHtml(u.phoneNumber || '')}</span></span>`;
          item.dataset.userId = u.id;
          item.addEventListener('click', () => onCreateConversationWithUser(u.id));
          listEl.appendChild(item);
        });
      })
      .catch(() => { listEl.innerHTML = '<div class="user-list-error">' + escapeHtml(t('feature_not_available') || 'This feature is not available.') + '</div>'; });
  }

  function onCreateConversationWithUser(otherUserId) {
    const initialMessage = $('new-chat-message').value.trim();
    const body = { otherUserId };
    if (initialMessage) body.initialMessage = initialMessage;
    if (pendingChatProductId) body.productId = pendingChatProductId;
    pendingChatProductId = null;
    pendingChatOtherUserId = null;
    $('user-list').innerHTML = `<div class="user-list-loading">Starting chat...</div>`;
    api('/conversations', { method: 'POST', body: JSON.stringify(body) })
      .then((conv) => { if (!conv || !conv.id) throw new Error('No conversation returned'); hide($('new-chat-form')); loadConversations(); selectConversation(conv.id); })
      .catch((err) => { showToast(err.message && err.message.includes('Not Found') ? (t('feature_not_available') || 'This feature is not available.') : err.message, 'error'); loadUserList($('new-chat-search').value.trim()); });
  }

  window._startChatWithProduct = function (product) {
    if (!product || !product.sellerId) return;
    if (product.sellerId === currentUser?.id) { showToast('You cannot chat with yourself', 'error'); return; }
    api(`/products/${product.id}/chat`, {
      method: 'POST',
    })
      .then((conversation) => {
        if (!conversation?.id) throw new Error('No conversation returned');
        conversationsCache = [conversation, ...conversationsCache.filter((c) => c.id !== conversation.id)];
        return openConversationById(conversation.id);
      })
      .catch((err) => {
        showToast(err.message || 'Failed to open chat', 'error');
      });
  };

  window._openChatForOrder = function (orderId) {
    if (!orderId || !accessToken) return;
    function trySelect() {
      const conv = conversationsCache.find((c) => c.pinnedOrder?.id === orderId);
      if (conv) {
        switchTab('chat');
        selectConversation(conv.id);
        return true;
      }
      return false;
    }
    if (trySelect()) return;
    api('/conversations?page=1&limit=100')
      .then((res) => {
        const list = res.data || res || [];
        conversationsCache = Array.isArray(list) ? list : [];
        if (trySelect()) return;
        showToast(t('no_conversations') || 'No chat found for this order.', 'info');
        switchTab('chat');
        loadConversations();
      })
      .catch(() => {
        showToast('Could not load conversations', 'error');
      });
  };

  function loadNotifications() {
    hide($('notifications-empty')); show($('notifications-loading')); $('notifications-list').innerHTML = '';
    const params = new URLSearchParams({ page: '1', limit: '50', sortOrder: 'desc' });
    if (notifFilter === 'unread') params.set('isRead', 'false');
    api(`/notifications?${params}`)
      .then((res) => { hide($('notifications-loading')); notificationsCache = res.data || res || []; renderNotifications(Array.isArray(notificationsCache) ? notificationsCache : []); })
      .catch(() => { hide($('notifications-loading')); notificationsCache = []; renderNotifications([]); });
  }

  function loadNotificationCount() {
    api('/notifications/unread/count')
      .then((res) => { const count = res.count || res || 0; const badge = $('notif-badge'); if (count > 0) { badge.textContent = count > 99 ? '99+' : count; show(badge); } else { hide(badge); } })
      .catch(() => {});
  }

  function renderNotifications(notifications) {
    const list = $('notifications-list'); list.innerHTML = '';
    if (notifications.length === 0) { show($('notifications-empty')); return; }
    hide($('notifications-empty'));
    notifications.forEach((n, i) => {
      const iconType = getNotifIconType(n.type);
      const iconSvg = getNotifIconSvg(n.type);
      const typeBadgeLabel = getNotifTypeLabel(n.type);
      const orderId = n.orderId || n.metadata?.orderId || n.data?.orderId;
      const showOpenChat = orderId && (n.type || '').includes('ORDER');
      const div = document.createElement('div');
      div.className = `notif-item ${n.isRead ? '' : 'unread'}`;
      div.style.animationDelay = `${i * 0.04}s`;
      const absTime = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
      div.innerHTML = `
        <div class="notif-icon ${iconType}">${iconSvg}</div>
        <div class="notif-body">
          <div class="notif-header">
            <span class="notif-title">${escapeHtml(n.title || n.type)}</span>
            <span class="notif-type-badge ${iconType}">${escapeHtml(typeBadgeLabel)}</span>
          </div>
          <div class="notif-message">${escapeHtml(n.message || '')}</div>
          <div class="notif-footer">
            <span class="notif-time" title="${escapeHtml(absTime)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${timeAgo(n.createdAt)}
            </span>
            ${showOpenChat ? `<button type="button" class="notif-open-chat-btn">${escapeHtml(t('open_chat'))}</button>` : ''}
            <span class="notif-unread-dot"></span>
          </div>
        </div>`;
      div.addEventListener('click', (e) => {
        if (e.target.closest('.notif-open-chat-btn')) {
          e.stopPropagation();
          window._openChatForOrder(orderId);
        }
        markNotificationRead(n.id);
      });
      list.appendChild(div);
    });
  }

  function getNotifIconType(type) {
    if (!type) return 'system';
    if (type.includes('OUTBID') || type.includes('BID')) return 'bid';
    if (type.includes('AUCTION')) return 'auction';
    if (type.includes('MESSAGE') || type.includes('CHAT')) return 'chat';
    if (type.includes('ORDER')) return 'order';
    return 'system';
  }

  function getNotifIconSvg(type) {
    if (!type) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type.includes('OUTBID')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
    if (type.includes('BID')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    if (type.includes('AUCTION_ENDED')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    if (type.includes('AUCTION')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    if (type.includes('MESSAGE') || type.includes('CHAT')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    if (type.includes('ORDER_DELIVERED')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    if (type.includes('ORDER_SHIPPED')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
    if (type.includes('ORDER')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  }

  function getNotifTypeLabel(type) {
    if (!type) return 'System';
    const labels = {
      AUCTION_ENDING_SOON: 'Ending Soon',
      AUCTION_ENDED: 'Ended',
      AUCTION_STARTED: 'Started',
      NEW_BID: 'New Bid',
      BID_REJECTED: 'Bid Rejected',
      ORDER_CONFIRMED: 'Processing',
      ORDER_DELIVERED: 'Delivery',
      ORDER_SHIPPED: 'Shipped',
      OUTBID: 'Outbid',
      SYSTEM: 'System',
    };
    return labels[type] || type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }

  function markNotificationRead(id) {
    api(`/notifications/${id}/read`, { method: 'POST' }).then(() => { loadNotifications(); loadNotificationCount(); }).catch(() => {});
  }

  function markAllNotificationsRead() {
    api('/notifications/read-all', { method: 'POST' })
      .then(() => { showToast(t('all_notifications_read'), 'success'); loadNotifications(); loadNotificationCount(); })
      .catch((err) => showToast(err.message, 'error'));
  }

  function init() {
    $('lang-switcher').value = currentLang;
    applyTranslations();

    $('btn-send-otp').addEventListener('click', onSendOtp);
    $('btn-verify').addEventListener('click', onVerify);
    $('btn-back-otp').addEventListener('click', () => { show($('login-step-send')); hide($('login-step-verify')); setLoginError(''); });
    $('btn-logout').addEventListener('click', onLogout);
    $('btn-auth-check')?.addEventListener('click', runAuthCheck);

    $('lang-switcher').addEventListener('change', (e) => { currentLang = e.target.value; localStorage.setItem('sb_lang', currentLang); applyTranslations(); });

    document.querySelectorAll('.tab-btn').forEach((btn) => { btn.addEventListener('click', () => switchTab(btn.dataset.tab)); });

    $('btn-notifications-bell').addEventListener('click', () => switchTab('notifications'));

    let productSearchTimeout = null;
    $('product-search-input').addEventListener('input', () => { clearTimeout(productSearchTimeout); productSearchTimeout = setTimeout(() => { productsPage = 1; loadProducts(); }, 400); });
    $('btn-create-product').addEventListener('click', showProductCreateForm);
    $('btn-empty-add-bouquet')?.addEventListener('click', showProductCreateForm);
    $('btn-cancel-create-product').addEventListener('click', hideProductCreateForm);
    $('product-create-form').addEventListener('submit', onCreateProduct);
    $('product-edit-form').addEventListener('submit', onUpdateProduct);
    $('pc-create-auction').addEventListener('change', (e) => { const fields = $('auction-fields'); if (e.target.checked) show(fields); else hide(fields); });

    const regionSel = $('pc-region');
    const citySel = $('pc-city');
    const districtSel = $('pc-district');
    if (regionSel) {
      regionSel.addEventListener('change', () => {
        const regionId = regionSel.value;
        setProductCreateLocationDistrictPlaceholder(true);
        if (!regionId) {
          setProductCreateLocationCityPlaceholder(true);
          return;
        }
        api('/locations/cities?regionId=' + encodeURIComponent(regionId))
          .then((res) => {
            const list = Array.isArray(res) ? res : (res?.data || []) || [];
            fillSelect('pc-city', list, 'id', 'name');
            citySel.disabled = false;
            setProductCreateLocationDistrictPlaceholder(true);
          })
          .catch(() => setProductCreateLocationCityPlaceholder(true));
      });
    }
    if (citySel) {
      citySel.addEventListener('change', () => {
        const cityId = citySel.value;
        if (!cityId) {
          setProductCreateLocationDistrictPlaceholder(true);
          return;
        }
        api('/locations/districts?cityId=' + encodeURIComponent(cityId))
          .then((res) => {
            const list = Array.isArray(res) ? res : (res?.data || []) || [];
            fillSelect('pc-district', list, 'id', 'name');
            districtSel.disabled = false;
          })
          .catch(() => setProductCreateLocationDistrictPlaceholder(true));
      });
    }
    const pcImagesInput = $('pc-images');
    if (pcImagesInput) {
      pcImagesInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const remaining = MAX_PRODUCT_IMAGES - pcUploadedImages.length;
        if (remaining <= 0) {
          showToast(t('product_images_hint') || 'Max 10 images.', 'info');
          e.target.value = '';
          return;
        }
        const toUpload = Array.from(files).slice(0, remaining);
        e.target.value = '';
        for (const file of toUpload) {
          try {
            await uploadProductImage(file);
          } catch (err) {
            const msg = err.message || '';
            showToast(msg.includes('Too many') || msg.includes('429') ? t('rate_limit_exceeded') : (msg || 'Upload failed'), 'error');
          }
        }
        renderProductCreateImagePreviews();
      });
    }
    $('products-prev').addEventListener('click', () => { productsPage--; loadProducts(); });
    $('products-next').addEventListener('click', () => { productsPage++; loadProducts(); });

    $('products-my-products').addEventListener('change', (e) => {
      productsMyProducts = e.target.checked;
      const bar = $('products-sale-phase-bar');
      if (bar) (productsMyProducts ? show : hide)(bar);
      productsPage = 1;
      loadProducts();
    });
    const productsStatusFilter = document.getElementById('products-status-filter');
    if (productsStatusFilter) productsStatusFilter.addEventListener('change', () => { productsPage = 1; loadProducts(); });

    const salePhaseBar = $('products-sale-phase-bar');
    if (salePhaseBar) {
      salePhaseBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn[data-sale-phase]');
        if (!btn) return;
        salePhaseBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        productsSalePhase = btn.dataset.salePhase || 'all';
        productsPage = 1;
        loadProducts();
      });
    }

    document.querySelectorAll('#product-detail-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideProductDetail); });
    document.querySelectorAll('#product-create-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideProductCreateForm); });
    document.querySelectorAll('#product-edit-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideProductEditForm); });
    $('btn-cancel-edit-product').addEventListener('click', hideProductEditForm);

    $('auction-status-filter').addEventListener('change', () => { auctionsPage = 1; loadAuctions(); });
    $('btn-refresh-auctions').addEventListener('click', () => loadAuctions());
    $('auctions-prev').addEventListener('click', () => { auctionsPage--; loadAuctions(); });
    $('auctions-next').addEventListener('click', () => { auctionsPage++; loadAuctions(); });
    document.querySelectorAll('#auction-detail-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideAuctionDetail); });

    const btnRefreshMod = $('btn-refresh-moderation');
    if (btnRefreshMod) btnRefreshMod.addEventListener('click', () => loadModeration());
    const modPrev = $('moderation-prev');
    const modNext = $('moderation-next');
    if (modPrev) modPrev.addEventListener('click', () => { moderationPage--; loadModeration(); });
    if (modNext) modNext.addEventListener('click', () => { moderationPage++; loadModeration(); });
    const rejectSubmit = $('reject-modal-submit');
    const rejectCancel = $('reject-modal-cancel');
    if (rejectSubmit) rejectSubmit.addEventListener('click', onSubmitReject);
    if (rejectCancel) rejectCancel.addEventListener('click', closeRejectModal);
    const rejectOverlay = $('reject-modal-overlay');
    if (rejectOverlay) rejectOverlay.addEventListener('click', (e) => { if (e.target === rejectOverlay) closeRejectModal(); });

    $('btn-new-chat').addEventListener('click', onNewChat);
    $('btn-cancel-new-chat').addEventListener('click', () => hide($('new-chat-form')));
    let userListSearchTimeout = null;
    $('new-chat-search').addEventListener('input', () => { clearTimeout(userListSearchTimeout); userListSearchTimeout = setTimeout(() => { loadUserList($('new-chat-search').value.trim()); }, 300); });
    const chatSearchInput = $('chat-message-search');
    if (chatSearchInput) {
      chatSearchInput.addEventListener('input', () => { clearTimeout(messageSearchTimeout); messageSearchTimeout = setTimeout(() => runMessageSearch(chatSearchInput.value), 300); });
      chatSearchInput.addEventListener('focus', () => { if ((chatSearchInput.value || '').trim().length >= 2) runMessageSearch(chatSearchInput.value); });
      chatSearchInput.addEventListener('blur', () => { setTimeout(hideMessageSearchResults, 200); });
    }
    document.addEventListener('click', (e) => { if ($('chat-search-results') && !$('chat-search-results').classList.contains('hidden') && !e.target.closest('.chat-search-wrap')) hideMessageSearchResults(); });
    $('message-form').addEventListener('submit', onSendMessage);
    $('message-input').addEventListener('input', onMessageInput)

    $('btn-mark-all-read').addEventListener('click', markAllNotificationsRead);
    $('btn-refresh-notifications').addEventListener('click', loadNotifications);
    document.querySelectorAll('.filter-btn').forEach((btn) => { btn.addEventListener('click', () => { document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active')); btn.classList.add('active'); notifFilter = btn.dataset.filter; loadNotifications(); }); });

    const topUpBtn = $('btn-top-up');
    if (topUpBtn) {
      topUpBtn.addEventListener('click', () => {
        if (!currentUser || !accessToken) {
          showToast(t('feature_not_available'), 'error');
          return;
        }
        const raw = window.prompt(t('balance_top_up') + ' — ' + (currentLang === 'ru' ? 'Введите сумму (UZS)' : currentLang === 'uz' ? 'Summani kiriting (UZS)' : 'Enter amount (UZS)'), '30000');
        if (raw == null || raw.trim() === '') return;
        const amount = parseInt(raw.trim(), 10);
        if (isNaN(amount) || amount < 1000) {
          showToast(currentLang === 'ru' ? 'Минимум 1000 UZS' : currentLang === 'uz' ? 'Minimum 1000 UZS' : 'Minimum 1000 UZS', 'error');
          return;
        }
        topUpBtn.disabled = true;
        api('/payments', {
          method: 'POST',
          body: JSON.stringify({ paymentType: 'TOP_UP', amount }),
        })
          .then((res) => {
            const data = res?.data !== undefined ? res.data : res;
            const paymentId = data?.paymentId || data?.id;
            const invoiceUrl = data?.invoiceUrl || '';
            const amountSent = data?.amount ?? amount;
            if (invoiceUrl && paymentId) {
              const url = invoiceUrl.includes('?') ? invoiceUrl + '&paymentId=' + encodeURIComponent(paymentId) + '&amount=' + amountSent : invoiceUrl + '?paymentId=' + encodeURIComponent(paymentId) + '&amount=' + amountSent;
              window.open(url, '_blank', 'noopener,noreferrer');
              showToast(t('balance_top_up') + ' — ' + (currentLang === 'ru' ? 'Откройте вкладку для оплаты' : currentLang === 'uz' ? 'To\'lov uchun yangi tab ochildi' : 'New tab opened for payment'), 'info');
            } else {
              showToast(t('balance_top_up') + ' ✓', 'success');
            }
            loadOrders();
          })
          .catch((err) => showToast(err.message || 'Payment failed', 'error'))
          .finally(() => { topUpBtn.disabled = false; });
      });
    }

    const refreshOrdersBtn = $('btn-refresh-orders');
    if (refreshOrdersBtn) refreshOrdersBtn.addEventListener('click', loadOrders);
    const ordersPrev = $('orders-prev');
    if (ordersPrev) ordersPrev.addEventListener('click', () => { ordersPage = (ordersPage || 1) - 1; loadOrders(); });
    const ordersNext = $('orders-next');
    if (ordersNext) ordersNext.addEventListener('click', () => { ordersPage = (ordersPage || 1) + 1; loadOrders(); });
    const ordersFilter = $('orders-status-filter');
    if (ordersFilter) ordersFilter.addEventListener('change', () => loadOrders());

    if (accessToken && currentUser) {
      showApp();
    } else {
      showLogin();
      refreshAuthStateBadge();
    }
  }

  init();
})();
