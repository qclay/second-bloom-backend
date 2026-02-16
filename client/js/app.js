(function () {
  'use strict';

  const API_BASE = window.TEST_APP_API_BASE || 'http://localhost:3000';
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
      tab_chat: 'Chat',
      tab_notifications: 'Notifications',
      search_products: 'Search products...',
      create_product: '+ Create Product',
      no_products: 'No products found. Create one to get started!',
      product_title: 'Title',
      product_description: 'Description',
      product_price: 'Price',
      product_currency: 'Currency',
      product_category: 'Category',
      product_condition: 'Condition',
      product_size: 'Size',
      product_tags: 'Tags (comma-separated)',
      product_region: 'Region / City',
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
      first_message_optional: 'First message (optional)',
      type_message: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      no_conversations: 'No conversations yet. Start a new chat!',
      select_conversation: 'Select a conversation or start a new chat.',
      someone_typing: 'Someone is typing...',
      tab_notifications_title: 'Notifications',
      mark_all_read: 'Mark all read',
      unread: 'Unread',
      no_notifications: 'No notifications yet.',
      views: 'views',
      auction_ended: 'Auction Ended',
      auction_active: 'Auction Active',
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
      product_created: 'Product created successfully!',
      product_updated: 'Product updated successfully!',
      product_deleted: 'Product deleted.',
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
      product_title: 'Sarlavha',
      product_description: 'Tavsif',
      product_price: 'Narx',
      product_currency: 'Valyuta',
      product_category: 'Kategoriya',
      product_condition: 'Holat',
      product_size: 'O\'lcham',
      product_tags: 'Teglar (vergul bilan)',
      product_region: 'Viloyat / Shahar',
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
      first_message_optional: 'Birinchi xabar (ixtiyoriy)',
      type_message: 'Xabar yozing...',
      send: 'Yuborish',
      online: 'Online',
      offline: 'Offline',
      no_conversations: 'Hali suhbatlar yo\'q. Yangi chat boshlang!',
      select_conversation: 'Suhbat tanlang yoki yangi chat boshlang.',
      someone_typing: 'Kimdir yozmoqda...',
      mark_all_read: 'Hammasini o\'qilgan deb belgilash',
      unread: 'O\'qilmagan',
      no_notifications: 'Hali bildirishnomalar yo\'q.',
      views: 'ko\'rishlar',
      auction_ended: 'Auktsion tugadi',
      auction_active: 'Auktsion faol',
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
      product_created: 'Mahsulot muvaffaqiyatli yaratildi!',
      product_updated: 'Mahsulot muvaffaqiyatli yangilandi!',
      product_deleted: 'Mahsulot o\'chirildi.',
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
      product_title: 'Название',
      product_description: 'Описание',
      product_price: 'Цена',
      product_currency: 'Валюта',
      product_category: 'Категория',
      product_condition: 'Состояние',
      product_size: 'Размер',
      product_tags: 'Теги (через запятую)',
      product_region: 'Регион / Город',
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
      first_message_optional: 'Первое сообщение (необязательно)',
      type_message: 'Введите сообщение...',
      send: 'Отправить',
      online: 'Онлайн',
      offline: 'Офлайн',
      no_conversations: 'Бесед пока нет. Начните новый чат!',
      select_conversation: 'Выберите беседу или начните новый чат.',
      someone_typing: 'Кто-то печатает...',
      mark_all_read: 'Прочитать все',
      unread: 'Непрочитанные',
      no_notifications: 'Уведомлений пока нет.',
      views: 'просмотры',
      auction_ended: 'Аукцион завершён',
      auction_active: 'Аукцион активен',
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
      product_created: 'Товар успешно создан!',
      product_updated: 'Товар успешно обновлён!',
      product_deleted: 'Товар удалён.',
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
  let chatSocket = null;
  let auctionSocket = null;
  let currentTab = 'products';

  let productsPage = 1;
  let productsCache = [];
  let productsTotalPages = 1;
  let currentProductDetail = null;
  let categoriesCache = [];
  let conditionsCache = [];
  let sizesCache = [];

  let auctionsPage = 1;
  let auctionsCache = [];
  let auctionsTotalPages = 1;
  let currentAuctionId = null;
  let currentAuctionCreatorId = null;
  let auctionTimerInterval = null;

  let currentConversationId = null;
  let conversationsCache = [];
  const onlineUsers = new Set();
  let typingTimeout = null;

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
    if (!iso) return '--';
    return new Date(iso).toLocaleString();
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('just_now');
    if (mins < 60) return t('minutes_ago').replace('{n}', mins);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('hours_ago').replace('{n}', hours);
    const days = Math.floor(hours / 24);
    return t('days_ago').replace('{n}', days);
  }

  function timeLeft(endTime) {
    if (!endTime) return '--';
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return t('ended');
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  let eventLogCount = 0;

  function logSocketEvent(source, eventName, detail) {
    eventLogCount++;
    const countEl = $('event-log-count');
    if (countEl) countEl.textContent = eventLogCount;

    const list = $('event-log-list');
    if (!list) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const item = document.createElement('div');
    item.className = 'event-log-item';
    item.innerHTML =
      `<span class="elog-time">${time}</span>` +
      `<span class="elog-source ${source}">${source}</span>` +
      `<span class="elog-event">${escapeHtml(eventName)}</span>` +
      `<span class="elog-detail">${escapeHtml(detail || '')}</span>`;
    list.prepend(item);

    while (list.children.length > 200) list.lastChild.remove();

    console.log(`[WS:${source}] ${eventName}`, detail);
  }

  function initEventLogPanel() {
    const header = $('event-log-header');
    const panel = $('event-log-panel');
    const toggleBtn = $('btn-toggle-log');
    const clearBtn = $('btn-clear-log');

    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('#btn-clear-log') || e.target.closest('#btn-toggle-log')) return;
        panel.classList.toggle('collapsed');
        toggleBtn.textContent = panel.classList.contains('collapsed') ? 'Expand' : 'Collapse';
      });
    }
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        toggleBtn.textContent = panel.classList.contains('collapsed') ? 'Expand' : 'Collapse';
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        $('event-log-list').innerHTML = '';
        eventLogCount = 0;
        $('event-log-count').textContent = '0';
      });
    }
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
      let raw;
      try { raw = text ? JSON.parse(text) : null; } catch { throw new Error(text || res.statusText); }
      if (!res.ok) {
        const err = raw?.error || raw;
        const message = typeof err === 'object' && err?.message ? err.message : (raw?.message || res.statusText);
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
    switchTab('products');
    connectChatSocket();
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
    if (chatSocket) { chatSocket.disconnect(); chatSocket = null; }
    if (auctionSocket) { auctionSocket.disconnect(); auctionSocket = null; }
    currentConversationId = null;
    currentAuctionId = null;
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
    else if (tab === 'chat') { loadConversations(); connectChatSocket(); }
    else if (tab === 'notifications') loadNotifications();
  }

  function loadProducts() {
    const search = $('product-search-input').value.trim();
    hide($('products-empty'));
    show($('products-loading'));
    $('products-grid').innerHTML = '';

    const params = new URLSearchParams({ page: String(productsPage), limit: '12' });
    if (search) params.set('search', search);

    api(`/products?${params}`)
      .then((res) => {
        hide($('products-loading'));
        const items = res.data || res || [];
        productsCache = Array.isArray(items) ? items : [];
        productsTotalPages = res.meta?.totalPages || 1;
        renderProducts(productsCache);
        updateProductsPagination();
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
      const statusClass = p.status === 'ACTIVE' ? 'status-active' : p.status === 'INACTIVE' ? 'status-inactive' : 'status-ended';
      const hasAuction = p.activeAuction;
      const tags = (p.tags || []).map((tg) => `<span class="tag">${escapeHtml(tg)}</span>`).join('');
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
          <span class="card-status ${statusClass}">${escapeHtml(p.status || 'ACTIVE')}</span>
          ${hasAuction ? '<span class="card-status status-pending">Auction</span>' : ''}
        </div>
        <h3 class="card-title">${escapeHtml(p.title)}</h3>
        <div class="card-meta">
          <span>${escapeHtml(p.category?.name || '')}</span>
          <span>${p.views || 0} ${t('views')}</span>
        </div>
        <div class="card-price">${formatPrice(hasAuction ? p.activeAuction.currentPrice : p.price, p.currency)}</div>
        ${hasAuction ? `<div style="font-size:.8rem;color:#eab308;margin-top:.35rem">${t('time_left')}: ${timeLeft(p.activeAuction.endTime)}</div>` : ''}
        <div class="card-tags">${tags}</div>
      `;
      card.addEventListener('click', () => showProductDetail(p.id));
      grid.appendChild(card);
    });
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
        const hasAuction = p.activeAuction;
        const statusClass = p.status === 'ACTIVE' ? 'status-active' : 'status-inactive';
        const tags = (p.tags || []).map((tg) => `<span class="tag">${escapeHtml(tg)}</span>`).join('');

        let auctionHtml = '';
        if (hasAuction) {
          const a = p.activeAuction;
          const aStatusClass = a.status === 'ACTIVE' ? 'status-active' : 'status-ended';
          auctionHtml = `
            <div class="detail-section">
              <h4>${t('auction_info')}</h4>
              <div class="detail-row"><span class="detail-label">Status</span><span class="card-status ${aStatusClass}">${a.status}</span></div>
              <div class="detail-row"><span class="detail-label">${t('current_price')}</span><span class="detail-value" style="color:#22c55e;font-size:1.2rem">${formatPrice(a.currentPrice, p.currency)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('start_price')}</span><span class="detail-value">${formatPrice(a.startPrice, p.currency)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('time_left')}</span><span class="detail-value auction-timer ${a.status !== 'ACTIVE' ? 'ended' : ''}">${a.status === 'ACTIVE' ? timeLeft(a.endTime) : t('ended')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('total_bids')}</span><span class="detail-value">${a.totalBids || 0}</span></div>
              <div class="detail-row"><span class="detail-label">${t('bid_increment')}</span><span class="detail-value">${formatPrice(a.bidIncrement, p.currency)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('auto_extend')}</span><span class="detail-value">${a.autoExtend ? t('yes') : t('no')}</span></div>
              ${a.status === 'ACTIVE' ? `<div style="margin-top:1rem"><button class="btn primary" onclick="window._goToAuction('${a.id}')">${t('place_bid')} &rarr;</button></div>` : ''}
            </div>
          `;
        }

        $('product-detail-content').innerHTML = `
          <div class="detail-content">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.75rem">
              <div>
                <h2 class="detail-title">${escapeHtml(p.title)}</h2>
                <span class="card-status ${statusClass}">${p.status}</span>
              </div>
              <div style="display:flex;gap:.5rem">
                <button class="btn primary small" onclick="window._editProduct()">${t('edit')}</button>
                <button class="btn danger small" onclick="window._deleteProduct('${p.id}')">${t('delete')}</button>
              </div>
            </div>
            <div class="detail-section">
              <h4>${t('product_details')}</h4>
              <div class="detail-row"><span class="detail-label">${t('product_price')}</span><span class="detail-value card-price">${formatPrice(p.price, p.currency)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_category')}</span><span class="detail-value">${escapeHtml(p.category?.name || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_condition')}</span><span class="detail-value">${escapeHtml(p.condition?.name || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_size')}</span><span class="detail-value">${escapeHtml(p.size?.name || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('product_region')}</span><span class="detail-value">${escapeHtml([p.region, p.city].filter(Boolean).join(', ') || '--')}</span></div>
              <div class="detail-row"><span class="detail-label">${t('views')}</span><span class="detail-value">${p.views || 0}</span></div>
              <div class="detail-row"><span class="detail-label">${t('created')}</span><span class="detail-value">${formatDate(p.createdAt)}</span></div>
              ${p.description ? `<div style="margin-top:.75rem;color:#8b98a5;font-size:.9rem">${escapeHtml(p.description)}</div>` : ''}
              <div class="card-tags" style="margin-top:.75rem">${tags}</div>
            </div>
            ${auctionHtml}
          </div>
        `;
      })
      .catch((err) => {
        $('product-detail-content').innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
      });
  }

  window._goToAuction = function (auctionId) {
    switchTab('auctions');
    setTimeout(() => showAuctionDetail(auctionId), 100);
  };

  window._deleteProduct = function (id) {
    if (!confirm(t('confirm_delete'))) return;
    api(`/products/${id}`, { method: 'DELETE' })
      .then(() => { showToast(t('product_deleted'), 'success'); hideProductDetail(); loadProducts(); })
      .catch((err) => showToast(err.message, 'error'));
  };

  function hideProductDetail() { hide($('product-detail-view')); show($('products-list-view')); currentProductDetail = null; }
  function showProductCreateForm() { hide($('products-list-view')); show($('product-create-view')); loadFormDropdowns(); }
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

    if (!title || !categoryId || !conditionId || !sizeId) { showToast(t('fill_required_fields'), 'error'); return; }

    const body = {
      title: { en: title },
      categoryId,
      conditionId,
      sizeId,
      currency,
    };
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
  }

  function fillSelect(selectId, items, valueKey, labelKey) {
    const sel = $(selectId);
    sel.innerHTML = '<option value="">-- Select --</option>';
    items.forEach((item) => { const opt = document.createElement('option'); opt.value = item[valueKey]; opt.textContent = item[labelKey]; sel.appendChild(opt); });
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
    const region = $('pc-region').value.trim() || undefined;
    const city = $('pc-city').value.trim() || undefined;
    const createAuction = $('pc-create-auction').checked;

    if (!title || !categoryId || !conditionId || !sizeId) { showToast(t('fill_required_fields'), 'error'); return; }

    const body = {
      title: { en: title },
      categoryId,
      conditionId,
      sizeId,
      currency,
    };
    if (description) body.description = { en: description };
    if (price) body.price = price;
    if (tags.length > 0) body.tags = tags;
    if (region) body.region = region;
    if (city) body.city = city;

    if (createAuction) {
      body.createAuction = true;
      const startPrice = parseFloat($('pc-auction-start-price').value) || price;
      const durationHours = parseInt($('pc-auction-duration').value) || 2;
      const autoExtend = $('pc-auction-auto-extend').checked;
      body.auction = { startPrice, durationHours, autoExtend };
    }

    api('/products', { method: 'POST', body: JSON.stringify(body) })
      .then(() => { showToast(t('product_created'), 'success'); hideProductCreateForm(); $('product-create-form').reset(); loadProducts(); })
      .catch((err) => showToast(err.message, 'error'));
  }

  function loadAuctions() {
    const status = $('auction-status-filter').value;
    hide($('auctions-empty')); show($('auctions-loading')); $('auctions-grid').innerHTML = '';
    const params = new URLSearchParams({ page: String(auctionsPage), limit: '12' });
    if (status) params.set('status', status);
    api(`/auctions?${params}`)
      .then((res) => { hide($('auctions-loading')); const items = res.data || res || []; auctionsCache = Array.isArray(items) ? items : []; auctionsTotalPages = res.meta?.totalPages || 1; renderAuctions(auctionsCache); updateAuctionsPagination(); })
      .catch((err) => { hide($('auctions-loading')); showToast(err.message, 'error'); auctionsCache = []; renderAuctions([]); });
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
    const isActive = a.status === 'ACTIVE';
    const statusClass = isActive ? 'status-active' : 'status-ended';
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
        </div>
        <div class="auction-info-card">
          <h4 style="margin:0 0 .75rem;color:#8b98a5;text-transform:uppercase;font-size:.85rem">${t('product_details')}</h4>
          <div class="detail-row"><span class="detail-label">${t('product_title')}</span><span class="detail-value">${escapeHtml(a.product?.title || '--')}</span></div>
          <div class="detail-row"><span class="detail-label">${t('product_price')}</span><span class="detail-value">${formatPrice(a.product?.price, a.product?.currency)}</span></div>
          <div class="detail-row"><span class="detail-label">${t('product_category')}</span><span class="detail-value">${escapeHtml(a.product?.category?.name || '--')}</span></div>
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

  function startAuctionTimer(auction) {
    clearInterval(auctionTimerInterval);
    if (auction.status !== 'ACTIVE') return;
    auctionTimerInterval = setInterval(() => {
      const timerEl = $('auction-timer');
      if (timerEl) {
        const left = timeLeft(auction.endTime);
        timerEl.textContent = `${t('time_left')}: ${left}`;
        if (left === t('ended')) { timerEl.classList.add('ended'); clearInterval(auctionTimerInterval); }
      }
    }, 1000);
  }

  function loadAuctionSection(auctionId, section) {
    const container = $('auction-section-content');
    container.innerHTML = `<div class="loading-state">${t('loading')}</div>`;
    const isAuctionOwner = currentUser?.id && currentAuctionCreatorId && currentUser.id === currentAuctionCreatorId;
    if (section === 'bids') {
      api(`/bids/auction/${auctionId}?limit=50&view=all`).then((res) => {
        const bids = res.data || res || [];
        if (bids.length === 0) { container.innerHTML = `<div class="empty-state">${t('no_bids')}</div>`; return; }
        container.innerHTML = '<div class="bid-feed" id="bid-feed"></div>';
        const feed = $('bid-feed');
        (Array.isArray(bids) ? bids : []).forEach((b) => { feed.appendChild(createBidItem(b, { showOwnerRemove: isAuctionOwner })); });
      }).catch((err) => { container.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`; });
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
    const { showRetract = false, showOwnerRemove = false } = typeof opts === 'boolean' ? { showRetract: opts } : opts;
    const div = document.createElement('div');
    div.className = `bid-item ${bid.isWinning ? 'winning' : ''} ${bid.isRetracted ? 'retracted' : ''}`;
    const userName = bid.bidder ? ([bid.bidder.firstName, bid.bidder.lastName].filter(Boolean).join(' ') || bid.bidder.phoneNumber || 'User') : 'User';
    const avatarUrl = bid.bidder?.avatarUrl || null;
    const initials = userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const isRejected = !!bid.rejectedAt;
    const statusTag = bid.isRetracted
      ? (isRejected
        ? `<span class="bid-status-tag rejected">${t('rejected')}</span>`
        : '<span class="bid-status-tag retracted">Retracted</span>')
      : '';
    const winTag = bid.isWinning ? `<span class="bid-status-tag winning">${t('winning')}</span>` : '';
    let actionBtn = '';
    if (!bid.isRetracted) {
      if (showRetract) actionBtn = `<button class="bid-action-btn retract" onclick="event.stopPropagation();window._retractBid('${bid.id}','retract')" title="${t('retract')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
      else if (showOwnerRemove) actionBtn = `<button class="bid-action-btn remove" onclick="event.stopPropagation();window._retractBid('${bid.id}','remove')" title="${t('remove_bid')}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`;
    }
    div.innerHTML = `
      <div class="bid-avatar">
        ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" />` : `<span class="bid-avatar-initials">${escapeHtml(initials)}</span>`}
      </div>
      <div class="bid-content">
        <div class="bid-top-row">
          <span class="bid-user">${escapeHtml(userName)}</span>
          <span class="bid-dot">&bull;</span>
          <span class="bid-time">${timeAgo(bid.createdAt)}</span>
          ${winTag}${statusTag}
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
      logSocketEvent('auction', 'connect', `Socket ID: ${auctionSocket.id}`);
      updateAuctionSocketStatus('connected');
      auctionSocket.emit('join_auction', { auctionId }, (response) => {
        if (response?.success) logSocketEvent('auction', 'join_auction', `Joined room for auction ${auctionId}`);
        else { logSocketEvent('auction', 'join_auction', `FAILED: ${response?.error || 'Unknown error'}`); showToast(t('failed_join_auction') + ': ' + (response?.error || ''), 'error'); }
      });
    });
    auctionSocket.on('disconnect', (reason) => { logSocketEvent('auction', 'disconnect', reason); updateAuctionSocketStatus('disconnected'); });
    auctionSocket.on('connect_error', (err) => { logSocketEvent('auction', 'connect_error', err.message); updateAuctionSocketStatus('disconnected'); });
    auctionSocket.on('connected', (data) => { logSocketEvent('auction', 'connected', `Server confirmed. User: ${data?.userId || 'unknown'}`); updateAuctionSocketStatus('connected'); });

    auctionSocket.on('new_bid', (data) => {
      const bidderName = data.bid?.bidder ? ([data.bid.bidder.firstName, data.bid.bidder.lastName].filter(Boolean).join(' ') || data.bid.bidder.phoneNumber || t('someone')) : t('someone');
      logSocketEvent('auction', 'new_bid', `${bidderName} bid ${formatPrice(data.bid?.amount)} on auction ${data.auctionId}`);
      showToast(t('new_bid_by').replace('{name}', bidderName).replace('{amount}', formatPrice(data.bid?.amount)), 'info');
      const priceEl = $('auction-current-price');
      if (priceEl && data.bid) priceEl.textContent = formatPrice(data.bid.amount);
      const feed = $('bid-feed');
      if (feed && data.bid) feed.prepend(createBidItem(data.bid));
    });
    auctionSocket.on('outbid', (data) => { logSocketEvent('auction', 'outbid', `You were outbid on auction ${data.auctionId}! New bid: ${formatPrice(data.bid?.amount)}`); showToast(t('you_have_been_outbid'), 'error'); });
    auctionSocket.on('bid_rejected', (data) => {
      logSocketEvent('auction', 'bid_rejected', `Bid ${data.bid?.id} rejected on auction ${data.auctionId}`);
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
    auctionSocket.on('auction_updated', (data) => { logSocketEvent('auction', 'auction_updated', `Auction ${data.auctionId} updated. Price: ${formatPrice(data.auction?.currentPrice)}`); showToast(t('auction_updated_price').replace('{amount}', formatPrice(data.auction?.currentPrice)), 'info'); if (data.auction) { const priceEl = $('auction-current-price'); if (priceEl) priceEl.textContent = formatPrice(data.auction.currentPrice); } });
    auctionSocket.on('auction_ended', (data) => { logSocketEvent('auction', 'auction_ended', `Auction ${data.auctionId} ended! Winner: ${data.winnerId || 'none'}`); showToast(t('auction_ended'), 'info'); clearInterval(auctionTimerInterval); const timerEl = $('auction-timer'); if (timerEl) { timerEl.textContent = t('auction_ended'); timerEl.classList.add('ended'); } });
    auctionSocket.on('auction_extended', (data) => { logSocketEvent('auction', 'auction_extended', `Auction ${data.auctionId} extended to ${formatDate(data.newEndTime)}. Reason: ${data.reason || ''}`); showToast(t('auction_extended_to').replace('{time}', formatDate(data.newEndTime)), 'info'); if (data.newEndTime) { const timerEl = $('auction-timer'); if (timerEl) timerEl.textContent = `${t('time_left')}: ${timeLeft(data.newEndTime)}`; } });
    auctionSocket.on('ping', () => { if (auctionSocket?.connected) auctionSocket.emit('pong', { timestamp: Date.now() }); });
    auctionSocket.on('error', (err) => { logSocketEvent('auction', 'error', err?.message || String(err)); showToast(t('socket_error') + ': ' + (err?.message || err), 'error'); });
  }

  function updateAuctionSocketStatus(status) {
    const el = $('auction-socket-status');
    if (!el) return;
    el.textContent = status === 'connected' ? 'Live' : 'Offline';
    el.className = 'ws-status ' + (status === 'connected' ? 'connected' : 'disconnected');
  }

  const CHAT_EVENTS = {
    JOIN_CONVERSATION: 'join_conversation', LEAVE_CONVERSATION: 'leave_conversation',
    SEND_MESSAGE: 'send_message', TYPING_START: 'typing_start', TYPING_STOP: 'typing_stop',
    MARK_READ: 'mark_read', CONNECTED: 'connected', NEW_MESSAGE: 'new_message',
    MESSAGE_DELETED: 'message_deleted', MESSAGE_EDITED: 'message_edited',
    USER_TYPING: 'user_typing', MESSAGES_READ: 'messages_read',
    DELETE_MESSAGE: 'delete_message', EDIT_MESSAGE: 'edit_message',
  };

  function connectChatSocket() {
    if (chatSocket?.connected) return;
    if (!accessToken) return;
    const base = API_BASE.replace(/\/$/, '');
    chatSocket = window.io(`${base}/chat`, { auth: { token: accessToken }, transports: ['websocket', 'polling'] });

    chatSocket.on('connect', () => { logSocketEvent('chat', 'connect', `Socket ID: ${chatSocket.id}`); updateWsStatus('connected'); if (currentTab === 'chat') loadConversations(); });
    chatSocket.on('disconnect', (reason) => { logSocketEvent('chat', 'disconnect', reason); updateWsStatus('disconnected'); });
    chatSocket.on('connect_error', (err) => { logSocketEvent('chat', 'connect_error', err.message); updateWsStatus('disconnected'); });
    chatSocket.on(CHAT_EVENTS.CONNECTED, (data) => { logSocketEvent('chat', 'connected', `User: ${data?.userId || 'unknown'}`); updateWsStatus('connected'); requestOnlineStatuses(); });
    chatSocket.on('user_presence', (data) => { logSocketEvent('chat', 'user_presence', `${data.userId} is ${data.isOnline ? 'online' : 'offline'}`); if (data.isOnline) onlineUsers.add(data.userId); else onlineUsers.delete(data.userId); updatePresenceUI(); });

    chatSocket.on(CHAT_EVENTS.NEW_MESSAGE, (message) => {
      const senderName = message.sender ? ([message.sender.firstName, message.sender.lastName].filter(Boolean).join(' ') || message.sender.phoneNumber || '') : '';
      const preview = (message.content || '').slice(0, 50);
      logSocketEvent('chat', 'new_message', `From ${senderName}: "${preview}"`);
      showToast(t('new_message_from').replace('{name}', senderName).replace('{text}', preview), 'info');
      if (message.conversationId === currentConversationId) appendMessage(message);
      if (currentTab === 'chat') loadConversations();
      loadNotificationCount();
    });

    chatSocket.on(CHAT_EVENTS.MESSAGE_DELETED, (data) => {
      logSocketEvent('chat', 'message_deleted', `Message ${data.messageId}`);
      showToast(t('message_deleted'), 'info');
      if (data.conversationId === currentConversationId) { const el = document.querySelector(`[data-message-id="${data.messageId}"]`); if (el) el.remove(); }
    });

    chatSocket.on(CHAT_EVENTS.MESSAGE_EDITED, (message) => {
      logSocketEvent('chat', 'message_edited', `Message ${message.id}: "${(message.content || '').slice(0, 50)}"`);
      showToast(t('message_edited'), 'info');
      if (message.conversationId === currentConversationId) {
        const el = document.querySelector(`[data-message-id="${message.id}"]`);
        if (el) { const contentEl = el.querySelector('.content'); if (contentEl) contentEl.textContent = message.content; if (!el.querySelector('.edited-tag')) { const tag = document.createElement('span'); tag.className = 'edited-tag'; tag.textContent = ' (edited)'; el.querySelector('.meta')?.prepend(tag); } }
      }
    });

    chatSocket.on(CHAT_EVENTS.USER_TYPING, (data) => { logSocketEvent('chat', 'user_typing', `User ${data.userId} ${data.isTyping ? 'started' : 'stopped'} typing`); if (data.conversationId !== currentConversationId) return; const el = $('typing-indicator'); el.textContent = data.isTyping ? t('someone_typing') : ''; if (data.isTyping) show(el); else hide(el); });
    chatSocket.on(CHAT_EVENTS.MESSAGES_READ, (data) => { logSocketEvent('chat', 'messages_read', `Conv ${data.conversationId}, ${data.count} messages by ${data.userId}`); });
    chatSocket.on('ping', () => { chatSocket.emit('pong', { timestamp: Date.now() }); });
  }

  function updateWsStatus(status) { const el = $('ws-status'); if (!el) return; el.textContent = status === 'connected' ? 'Live' : 'Offline'; el.className = 'ws-status ' + (status === 'connected' ? 'connected' : 'disconnected'); }

  function requestOnlineStatuses() {
    if (!chatSocket?.connected || conversationsCache.length === 0) return;
    const userIds = [];
    conversationsCache.forEach((c) => { const other = c.participants?.find((p) => p.id !== currentUser?.id); if (other) userIds.push(other.id); });
    if (userIds.length === 0) return;
    chatSocket.emit('get_online_status', { userIds }, (res) => { if (res?.statuses) { Object.entries(res.statuses).forEach(([uid, isOnline]) => { if (isOnline) onlineUsers.add(uid); else onlineUsers.delete(uid); }); updatePresenceUI(); } });
  }

  function updatePresenceUI() {
    document.querySelectorAll('.conversation-list li').forEach((li) => {
      const cid = li.dataset.conversationId; const conv = conversationsCache.find((c) => c.id === cid); const other = conv?.participants?.find((p) => p.id !== currentUser?.id); const dot = li.querySelector('.online-dot');
      if (other && onlineUsers.has(other.id)) { if (!dot) { const d = document.createElement('span'); d.className = 'online-dot'; li.querySelector('.conv-row')?.prepend(d); } } else if (dot) { dot.remove(); }
    });
    if (currentConversationId) { const conv = conversationsCache.find((c) => c.id === currentConversationId); const other = conv?.participants?.find((p) => p.id !== currentUser?.id); const statusEl = $('conversation-status'); if (statusEl && other) { const isOnline = onlineUsers.has(other.id); statusEl.textContent = isOnline ? t('online') : t('offline'); statusEl.className = 'conversation-status ' + (isOnline ? 'online' : 'offline'); } }
  }

  function loadConversations() {
    if (!accessToken) return;
    api('/chat/conversations?page=1&limit=50')
      .then((res) => { const list = res.data || res || []; conversationsCache = Array.isArray(list) ? list : []; renderConversationList(conversationsCache); requestOnlineStatuses(); })
      .catch((err) => { console.error('Load conversations:', err); conversationsCache = []; renderConversationList([]); });
  }

  function renderConversationList(conversations) {
    const listEl = $('conversation-list'); const emptyEl = $('conversation-list-empty'); listEl.innerHTML = '';
    if (conversations.length === 0) { show(emptyEl); return; }
    hide(emptyEl);
    conversations.forEach((c) => {
      const other = c.participants?.find((p) => p.id !== currentUser?.id);
      const name = [other?.firstName, other?.lastName].filter(Boolean).join(' ') || other?.phoneNumber || 'Chat';
      const preview = c.lastMessage?.content ? (c.lastMessage.content.slice(0, 40) + (c.lastMessage.content.length > 40 ? '...' : '')) : 'No messages yet';
      const unread = c.unreadCount || 0;
      const isOnline = other && onlineUsers.has(other.id);
      const li = document.createElement('li'); li.dataset.conversationId = c.id;
      li.innerHTML = `<div class="conv-row">${isOnline ? '<span class="online-dot"></span>' : ''}<strong>${escapeHtml(name)}</strong>${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}</div><div class="conv-preview">${escapeHtml(preview)}</div>`;
      li.addEventListener('click', () => selectConversation(c.id));
      if (c.id === currentConversationId) li.classList.add('active');
      listEl.appendChild(li);
    });
  }

  function selectConversation(conversationId) {
    if (currentConversationId && chatSocket?.connected) chatSocket.emit(CHAT_EVENTS.LEAVE_CONVERSATION, { conversationId: currentConversationId });
    currentConversationId = conversationId;
    document.querySelectorAll('.conversation-list li').forEach((li) => { li.classList.toggle('active', li.dataset.conversationId === conversationId); });
    hide($('no-conversation')); show($('conversation-view'));
    if (chatSocket?.connected) chatSocket.emit(CHAT_EVENTS.JOIN_CONVERSATION, { conversationId });
    const conv = conversationsCache.find((c) => c.id === conversationId);
    const other = conv ? conv.participants?.find((p) => p.id !== currentUser?.id) : null;
    const name = other ? [other.firstName, other.lastName].filter(Boolean).join(' ') || other.phoneNumber : 'Chat';
    $('conversation-title').textContent = name;
    const statusEl = $('conversation-status');
    if (statusEl && other) { const isOnline = onlineUsers.has(other.id); statusEl.textContent = isOnline ? t('online') : t('offline'); statusEl.className = 'conversation-status ' + (isOnline ? 'online' : 'offline'); }
    $('messages-list').innerHTML = '';
    api(`/chat/conversations/${conversationId}/messages?limit=50`)
      .then((res) => {
        const messages = res.data || res || [];
        (Array.isArray(messages) ? messages : []).forEach((m) => appendMessage(m, { noScroll: true }));
        scrollMessagesToBottom();
        if (messages.length > 0 && chatSocket?.connected) chatSocket.emit(CHAT_EVENTS.MARK_READ, { conversationId }, () => { loadConversations(); });
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
    const edited = message.isEdited ? '<span class="edited-tag"> (edited)</span>' : '';
    bubble.innerHTML = (senderName ? `<div class="sender-name">${escapeHtml(senderName)}</div>` : '') + `<div class="content">${escapeHtml(message.content || '')}</div>` + `<div class="meta">${edited}${time}</div>`;
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
    if (chatSocket?.connected) {
      chatSocket.emit(CHAT_EVENTS.TYPING_STOP, { conversationId: currentConversationId });
      chatSocket.emit(CHAT_EVENTS.SEND_MESSAGE, { conversationId: currentConversationId, content }, (res) => { if (res?.error) showToast(res.error, 'error'); });
    }
  }

  function onMessageInput() {
    if (!currentConversationId || !chatSocket?.connected) return;
    chatSocket.emit(CHAT_EVENTS.TYPING_START, { conversationId: currentConversationId });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => { chatSocket.emit(CHAT_EVENTS.TYPING_STOP, { conversationId: currentConversationId }); }, 2000);
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
    api(`/chat/users?${params}`)
      .then((res) => {
        const users = res.data || res || []; listEl.innerHTML = '';
        if (users.length === 0) { listEl.innerHTML = '<div class="user-list-empty">No users found.</div>'; return; }
        users.forEach((u) => {
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.phoneNumber || u.id;
          const item = document.createElement('button'); item.type = 'button'; item.className = 'user-list-item';
          item.innerHTML = `<strong>${escapeHtml(name)}</strong><span class="user-list-meta">${escapeHtml(u.phoneNumber || '')}</span>`;
          item.dataset.userId = u.id;
          item.addEventListener('click', () => onCreateConversationWithUser(u.id));
          listEl.appendChild(item);
        });
      })
      .catch((err) => { listEl.innerHTML = `<div class="user-list-error">${escapeHtml(err.message)}</div>`; });
  }

  function onCreateConversationWithUser(otherUserId) {
    const initialMessage = $('new-chat-message').value.trim();
    const body = { otherUserId };
    if (initialMessage) body.initialMessage = initialMessage;
    $('user-list').innerHTML = `<div class="user-list-loading">Starting chat...</div>`;
    api('/chat/conversations', { method: 'POST', body: JSON.stringify(body) })
      .then((conv) => { if (!conv || !conv.id) throw new Error('No conversation returned'); hide($('new-chat-form')); loadConversations(); selectConversation(conv.id); })
      .catch((err) => { showToast(err.message, 'error'); loadUserList($('new-chat-search').value.trim()); });
  }

  function loadNotifications() {
    hide($('notifications-empty')); show($('notifications-loading')); $('notifications-list').innerHTML = '';
    const params = new URLSearchParams({ page: '1', limit: '50', sortOrder: 'desc' });
    if (notifFilter === 'unread') params.set('isRead', 'false');
    api(`/notifications?${params}`)
      .then((res) => { hide($('notifications-loading')); notificationsCache = res.data || res || []; renderNotifications(Array.isArray(notificationsCache) ? notificationsCache : []); })
      .catch((err) => { hide($('notifications-loading')); showToast(err.message, 'error'); renderNotifications([]); });
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
            <span class="notif-unread-dot"></span>
          </div>
        </div>`;
      div.addEventListener('click', () => markNotificationRead(n.id));
      list.appendChild(div);
    });
  }

  function getNotifIconType(type) {
    if (!type) return 'system';
    if (type.includes('OUTBID') || type.includes('BID')) return 'bid';
    if (type.includes('AUCTION')) return 'auction';
    if (type.includes('MESSAGE') || type.includes('CHAT')) return 'chat';
    if (type.includes('ORDER')) return 'order';
    if (type.includes('REVIEW')) return 'review';
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
    if (type.includes('REVIEW')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  }

  function getNotifTypeLabel(type) {
    if (!type) return 'System';
    const labels = {
      AUCTION_ENDING_SOON: 'Ending Soon',
      AUCTION_ENDED: 'Ended',
      AUCTION_STARTED: 'Started',
      NEW_BID: 'New Bid',
      ORDER_CONFIRMED: 'Confirmed',
      ORDER_DELIVERED: 'Delivered',
      ORDER_SHIPPED: 'Shipped',
      OUTBID: 'Outbid',
      REVIEW_RECEIVED: 'Review',
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

    $('lang-switcher').addEventListener('change', (e) => { currentLang = e.target.value; localStorage.setItem('sb_lang', currentLang); applyTranslations(); });

    document.querySelectorAll('.tab-btn').forEach((btn) => { btn.addEventListener('click', () => switchTab(btn.dataset.tab)); });

    $('btn-notifications-bell').addEventListener('click', () => switchTab('notifications'));

    let productSearchTimeout = null;
    $('product-search-input').addEventListener('input', () => { clearTimeout(productSearchTimeout); productSearchTimeout = setTimeout(() => { productsPage = 1; loadProducts(); }, 400); });
    $('btn-create-product').addEventListener('click', showProductCreateForm);
    $('btn-cancel-create-product').addEventListener('click', hideProductCreateForm);
    $('product-create-form').addEventListener('submit', onCreateProduct);
    $('product-edit-form').addEventListener('submit', onUpdateProduct);
    $('pc-create-auction').addEventListener('change', (e) => { const fields = $('auction-fields'); if (e.target.checked) show(fields); else hide(fields); });
    $('products-prev').addEventListener('click', () => { productsPage--; loadProducts(); });
    $('products-next').addEventListener('click', () => { productsPage++; loadProducts(); });

    document.querySelectorAll('#product-detail-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideProductDetail); });
    document.querySelectorAll('#product-create-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideProductCreateForm); });
    document.querySelectorAll('#product-edit-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideProductEditForm); });
    $('btn-cancel-edit-product').addEventListener('click', hideProductEditForm);

    $('auction-status-filter').addEventListener('change', () => { auctionsPage = 1; loadAuctions(); });
    $('btn-refresh-auctions').addEventListener('click', () => loadAuctions());
    $('auctions-prev').addEventListener('click', () => { auctionsPage--; loadAuctions(); });
    $('auctions-next').addEventListener('click', () => { auctionsPage++; loadAuctions(); });
    document.querySelectorAll('#auction-detail-view .btn-back').forEach((btn) => { btn.addEventListener('click', hideAuctionDetail); });

    $('btn-new-chat').addEventListener('click', onNewChat);
    $('btn-cancel-new-chat').addEventListener('click', () => hide($('new-chat-form')));
    let userListSearchTimeout = null;
    $('new-chat-search').addEventListener('input', () => { clearTimeout(userListSearchTimeout); userListSearchTimeout = setTimeout(() => { loadUserList($('new-chat-search').value.trim()); }, 300); });
    $('message-form').addEventListener('submit', onSendMessage);
    $('message-input').addEventListener('input', onMessageInput)

    $('btn-mark-all-read').addEventListener('click', markAllNotificationsRead);
    $('btn-refresh-notifications').addEventListener('click', loadNotifications);
    document.querySelectorAll('.filter-btn').forEach((btn) => { btn.addEventListener('click', () => { document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active')); btn.classList.add('active'); notifFilter = btn.dataset.filter; loadNotifications(); }); });

    initEventLogPanel();

    if (accessToken && currentUser) showApp();
    else showLogin();
  }

  init();
})();
