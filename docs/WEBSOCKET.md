# WebSocket — Second Bloom

Описывает подключение к чату (conversation), события и структуры данных для интеграции с Flutter/mobile клиентом.

---

## 1. Подключение

**Namespace:** `/conversation`  
**URL:** `wss://api.secondbloom.uz/conversation` (или `ws://localhost:3000/conversation` для dev)

**Аутентификация** — JWT в одном из форматов:
- `Authorization: Bearer <token>` в заголовках
- `auth: { token: '<token>' }` в handshake
- query-параметр: `?token=<token>`

После успешного подключения сервер отправит событие `connected`:
```json
{
  "userId": "uuid",
  "socketId": "socket-id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Если токен невалиден — клиент будет отключён.

---

## 2. События (client → server)

Клиент отправляет события, сервер отвечает в ответе на тот же вызов (ACK).

| Событие | Payload | Описание |
|---------|---------|----------|
| `join_conversation` | `{ "conversationId": "uuid" }` | Войти в комнату чата. Нужно вызывать при открытии экрана чата. |
| `leave_conversation` | `{ "conversationId": "uuid" }` | Выйти из комнаты чата. |
| `send_message` | `{ "conversationId", "content", "messageType?", "fileId?", "replyToMessageId?" }` | Отправить сообщение. |
| `typing_start` | `{ "conversationId": "uuid" }` | Начал печатать. |
| `typing_stop` | `{ "conversationId": "uuid" }` | Перестал печатать. |
| `mark_read` | `{ "conversationId": "uuid", "messageIds"?: ["id1","id2"] }` | Отметить сообщения как прочитанные. |
| `delete_message` | `{ "messageId": "uuid" }` | Удалить своё сообщение. |
| `edit_message` | `{ "messageId": "uuid", "content": "новый текст" }` | Редактировать своё сообщение. |
| `get_online_status` | `{ "userIds": ["uuid1", "uuid2"] }` | Узнать, онлайн ли пользователи. |

### Ответы сервера (ACK)

- Успех: `{ "success": true, ... }` или `{ "message": {...} }` и т.д.
- Ошибка: `{ "error": "текст ошибки" }` или `{ "success": false, "error": "..." }`.

---

## 3. События (server → client)

Сервер шлёт события клиентам в комнатах (если они вызвали `join_conversation`).

| Событие | Payload | Описание |
|---------|---------|----------|
| `connected` | `{ userId, socketId, timestamp }` | Подтверждение подключения. |
| `new_message` | `ConversationMessageResponseDto` | Новое сообщение в чате. |
| `message_deleted` | `{ "messageId", "conversationId" }` | Сообщение удалено. |
| `message_edited` | `ConversationMessageResponseDto` | Сообщение отредактировано. |
| `user_typing` | `{ "conversationId", "userId", "isTyping" }` | Пользователь печатает / перестал печатать. |
| `messages_read` | `{ "conversationId", "userId", "count" }` | Сообщения помечены прочитанными. |
| `user_presence` | `{ "userId", "isOnline", "timestamp" }` | Пользователь вышел/зашёл онлайн. |

---

## 4. Структура сообщения (`new_message` / `send_message`)

```typescript
{
  id: string;
  conversationId: string;
  sender: {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    isAdministrationChat?: boolean;  // true для чата с поддержкой
  };
  replyToMessageId?: string | null;
  messageType: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  content: string;
  file?: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  } | null;
  deliveryStatus: "SENT" | "DELIVERED" | "READ";
  isRead: boolean;
  readAt?: string | null;
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;   // ISO 8601
  updatedAt: string;
  metadata?: Record<string, unknown> | null;  // системные метаданные (напр. MODERATION_REJECT)
}
```

---

## 5. REST API — как открыть чат

### Список чатов
```
GET /api/v1/conversations
Authorization: Bearer <token>
```

В ответе — массив чатов с полями `flowerId`, `flowerImageUrl`, `pinnedProduct`, `pinnedOrder` и т.д.

### Чат с конкретным пользователем (продавцом) по товару

```
POST /api/v1/conversations/by-product
Authorization: Bearer <token>
Content-Type: application/json

{ "productId": "uuid" }
```

Создаёт или возвращает чат между текущим пользователем и продавцом товара. В ответе — полный объект `ConversationResponseDto`, включая `id`, `flowerId`, `flowerImageUrl`, `participants` и др.

### Открыть чат по `conversationId`

1. `GET /api/v1/conversations/:id` — детали чата.
2. `GET /api/v1/conversations/:conversationId/messages` — история сообщений (пагинация по cursor).
3. Подключиться к WebSocket, вызвать `join_conversation` с этим `conversationId`.

---

## 6. Рекомендуемый порядок действий (Flutter)

1. При логине сохранить JWT.
2. Подключиться к WebSocket с этим токеном.
3. Дождаться события `connected`.
4. При открытии экрана чата:
   - Вызвать `join_conversation` с `conversationId`.
   - Подписаться на `new_message`, `message_edited`, `message_deleted`, `user_typing`, `messages_read`.
5. При закрытии экрана — `leave_conversation`.
6. Для отправки — `send_message` с `conversationId`, `content`, опционально `messageType`, `fileId`, `replyToMessageId`.

---

## 7. Ограничения

- `content` — максимум 5000 символов.
- Поддерживаются типы: `TEXT`, `IMAGE`, `FILE`, `SYSTEM` (системные — не создаются клиентом).
- Вложение — по `fileId` из предварительной загрузки файла через `POST /api/v1/files`.
