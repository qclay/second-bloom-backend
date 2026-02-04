# WebSocket: Auction & Chat

The app exposes two **Socket.IO** namespaces: **Auction** (live bids, outbid, ended) and **Chat** (messages, typing, read receipts). Both require a valid JWT for connection.

---

## Device connection: one base URL, same auth for both

**One base URL, two paths:** Use your API base (e.g. `http://localhost:3000` or `https://your-api.com`). The device opens **two** connections if it needs both auction and chat:

- Auction: `{BASE_URL}/auction`
- Chat: `{BASE_URL}/chat`

**User and device (and other) info:** Send everything in the **handshake** when connecting. The server does **not** use a separate “device info” URL or query; it only uses:

| What        | Where to send | Required |
|------------|----------------|----------|
| **User**   | JWT only — server reads `userId` from token (`payload.sub` or `payload.id`) | Yes |
| **Token**  | `Authorization: Bearer <token>`, or `auth.token`, or `query.token` | Yes |
| **Device** | Optional: `auth.deviceId` or `query.deviceId` (Auction gateway stores it) | No |
| **Others** | User-Agent, IP, platform are read from request headers automatically | — |

So the device uses **one base URL** and the **same token (and optional deviceId)** for both connections. No need to send user id or profile separately — the server gets the user from the JWT.

**Example (one device, both features):**

```js
const base = 'http://localhost:3000';
const token = 'YOUR_JWT';
const deviceId = 'optional-device-uuid';

const auctionSocket = io(`${base}/auction`, {
  auth: { token, deviceId },
  transports: ['websocket'],
});

const chatSocket = io(`${base}/chat`, {
  auth: { token },
  transports: ['websocket'],
});
```

If you need **only one connection** (e.g. app only does chat or only auctions), connect to the path you need; user is always identified by the JWT.

---

## 1. Auction WebSocket (`/auction`)

**Purpose:** Real-time updates for a specific auction (new bid, outbid, auction updated/ended/extended).

### Connection

- **URL:** `http://localhost:3000/auction` (or your `PORT` and host).
- **Auth:** Send JWT via one of:
  - `Authorization: Bearer <token>` (header)
  - `auth: { token: '<token>' }` (handshake auth)
  - `query.token=<token>` (query)

### Client → Server (emit)

| Event              | Payload              | Description                    |
|--------------------|----------------------|--------------------------------|
| `join_auction`     | `{ auctionId: string }` | Join room for an auction    |
| `leave_auction`    | `{ auctionId: string }` | Leave room                  |
| `pong`             | (any)                | Reply to server ping (keepalive) |

### Server → Client (listen)

| Event             | When                         | Payload shape                          |
|-------------------|------------------------------|----------------------------------------|
| `connected`       | Right after connect           | `{ userId, socketId, deviceId?, timestamp }` |
| `new_bid`          | Someone placed a bid         | `{ auctionId, bid, timestamp }`       |
| `outbid`           | Current high bidder was outbid | `{ auctionId, bid, timestamp }` (sent only to that user) |
| `auction_updated`  | Auction data changed         | `{ auctionId, auction, timestamp }`    |
| `auction_ended`    | Auction finished              | `{ auctionId, auction, winnerId?, timestamp }` |
| `auction_extended` | End time extended             | `{ auctionId, newEndTime, reason, timestamp }` |
| `ping`             | Keepalive                     | `{ timestamp }` — client should reply with `pong` |

### Flow

1. Connect with JWT → receive `connected`.
2. Emit `join_auction` with `auctionId` → you are in room `auction:<auctionId>`.
3. When `BidService` creates a bid it calls `AuctionGateway.notifyNewBid(auctionId, bid)` → everyone in that room gets `new_bid`.
4. Previous high bidder gets `outbid` via `AuctionGateway.notifyOutbid(userId, auctionId, bid)`.
5. On end/extend, gateway emits `auction_ended` / `auction_extended` to the room.

---

## 2. Chat WebSocket (`/chat`)

**Purpose:** Real-time chat: send message, typing indicators, mark read, delete/edit message.

### Connection

- **URL:** `http://localhost:3000/chat`.
- **Auth:** Same as auction (header, `auth.token`, or `query.token`).

On connect, the server **auto-joins** the user to all their conversations (first 50), so they get events for those rooms without calling `join_conversation` first.

### Client → Server (emit)

| Event                | Payload | Description |
|----------------------|--------|-------------|
| `join_conversation`  | `{ conversationId: string }` | Join a conversation room |
| `leave_conversation` | `{ conversationId: string }` | Leave room |
| `send_message`       | `{ conversationId, content, replyToMessageId?, messageType? }` | Send a message (persisted via `ChatService`) |
| `typing_start`       | `{ conversationId }` | User started typing |
| `typing_stop`        | `{ conversationId }` | User stopped typing |
| `mark_read`         | `{ conversationId, messageIds? }` | Mark messages as read |
| `delete_message`    | `{ messageId }` | Delete own message |
| `edit_message`      | `{ messageId, content }` | Edit own message |
| `pong`               | (any)  | Reply to ping |

### Server → Client (listen)

| Event           | When           | Payload shape |
|-----------------|----------------|---------------|
| `connected`     | After connect  | `{ userId, socketId, timestamp }` |
| `new_message`   | New message in conversation | Full message DTO |
| `message_deleted` | A message was deleted | Message id / payload |
| `message_edited`  | A message was edited | Updated message |
| `user_typing`    | Someone typing in conversation | `{ conversationId, userId, isTyping }` |
| `messages_read` | Messages marked read | Read receipt payload |
| `ping`          | Keepalive      | `{ timestamp }` → reply with `pong` |

### Flow (send message)

1. Connect with JWT → `connected`; server auto-joins you to your conversations.
2. Optionally emit `join_conversation` for a specific `conversationId`.
3. Emit `send_message` with `conversationId` and `content`.
4. Server calls `ChatService.sendMessage()`, then:
   - Emits `new_message` to room `conversation:<conversationId>`.
   - Emits `new_message` to the other participant’s sockets via `sendToUser(recipientId, ...)`.
5. Typing: emit `typing_start` / `typing_stop` → others in that room get `user_typing`.

---

## 3. How to check

### 3.1 Health endpoint (no auth)

```bash
curl -s http://localhost:3000/health/websocket
```

Example response:

```json
{
  "status": "ok",
  "timestamp": "2026-02-02T...",
  "chat": { "connections": 0, "rooms": 0 },
  "auction": { "connections": 0, "rooms": 0 },
  "metrics": { ... }
}
```

- **chat.connections** / **auction.connections**: number of connected sockets.
- **chat.rooms** / **auction.rooms**: number of conversation/auction rooms with at least one member.

If the app is running but you see `"WebSocket gateways not available"`, the gateways failed to init (check server logs).

### 3.2 Get a JWT

Use your auth API (e.g. login) and copy the access token:

```bash
# Example (adjust to your login endpoint and body)
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneCountryCode":"+998","phoneNumber":"901234567","code":"123456"}' \
  | jq -r '.accessToken'
```

### 3.3 Test with Socket.IO client (Node)

Install:

```bash
npm install socket.io-client
```

**Auction:**

```js
const io = require('socket.io-client');
const token = 'YOUR_JWT';

const socket = io('http://localhost:3000/auction', {
  auth: { token },
  transports: ['websocket'],
});

socket.on('connect', () => console.log('Connected'));
socket.on('connected', (data) => console.log('Authenticated', data));
socket.on('new_bid', (data) => console.log('New bid', data));
socket.on('outbid', (data) => console.log('Outbid', data));

socket.emit('join_auction', { auctionId: 'some-auction-uuid' });
```

**Chat:**

```js
const socket = io('http://localhost:3000/chat', {
  auth: { token },
  transports: ['websocket'],
});

socket.on('connect', () => console.log('Connected'));
socket.on('connected', (data) => console.log('Authenticated', data));
socket.on('new_message', (msg) => console.log('New message', msg));

socket.emit('join_conversation', { conversationId: 'conv-uuid' });
socket.emit('send_message', { conversationId: 'conv-uuid', content: 'Hello' });
```

### 3.4 Test with browser console

From a page that has your JWT (e.g. after login):

```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script>
  const token = 'YOUR_JWT';
  const socket = io('http://localhost:3000/auction', { auth: { token } });
  socket.on('connected', (d) => console.log('Auction WS OK', d));
  socket.emit('join_auction', { auctionId: 'AUCTION_ID' });
</script>
```

Replace namespace and events for chat (`/chat`, `join_conversation`, `send_message`, etc.).

### 3.5 Test with Postman (step-by-step)

**Important:** The server does **not** have a `/ws` namespace. Use **`/auction`** or **`/chat`** only. Connecting to `http://localhost:3000/ws` causes **"Invalid namespace"** because no gateway listens on `/ws`.

#### Step 1: Get a JWT

- In Postman (or curl): **POST** `http://localhost:3000/api/v1/auth/verify`
- Body (JSON): `{"countryCode":"+998","phoneNumber":"901234569","code":123456}` (use a real code after sending OTP, or run `npm run scripts:seed-otp` then use `123456`)
- From the response, copy `accessToken`

#### Step 2: New Socket.IO request

- In Postman: **New** → **Socket.IO** (or **WebSocket**; choose Socket.IO if available)
- Do **not** use `/ws`. The backend only has `/auction` and `/chat`

#### Step 3: Set the URL

- **For auction:** `http://localhost:3000/auction`
- **For chat:** `http://localhost:3000/chat`
- Use your real host/port if different (e.g. `https://your-api.com/auction`)

#### Step 4: Add token (Params or Headers)

- Open the **Params** tab
- Add a query parameter:
  - **Key:** `token`
  - **Value:** paste your `accessToken`
- Or in **Headers**: `Authorization` = `Bearer YOUR_ACCESS_TOKEN`

#### Step 5: Connect

- Click **Connect**
- You should see the connection open and a **`connected`** event in the response (with `userId`, `socketId`)
- If you see **"Invalid namespace"**, the URL path is wrong — use `/auction` or `/chat`, not `/ws`

#### Step 6: Add listeners (optional)

- In the **Events** / **Listeners** panel, add event names to listen for:
  - **Auction:** `connected`, `new_bid`, `outbid`, `auction_ended`, `ping`
  - **Chat:** `connected`, `new_message`, `user_typing`, `ping`
- Incoming events will appear in the message list

#### Step 7: Send events (Message tab)

- Open the **Message** tab to emit events
- **Auction:** event name `join_auction`, payload `{"auctionId":"<your-auction-uuid>"}`
- **Chat:** event `join_conversation`, payload `{"conversationId":"<uuid>"}`; or `send_message` with `{"conversationId":"<uuid>","content":"Hello"}`
- When you receive a **`ping`** event, send **`pong`** (payload optional) to keep the connection alive

#### Step 8: Quick check

- URL: `http://localhost:3000/auction`
- Params: `token` = your JWT
- Connect → add listener `connected` → you should see `connected` with `userId`. Then WebSocket + auth are working.

### 3.6 Quick checklist

| Check | Action |
|-------|--------|
| Gateways up | `GET /health/websocket` → `chat` and `auction` present |
| Auction connect | Connect to `/auction` with JWT → receive `connected` |
| Auction room | Emit `join_auction` → place bid via HTTP API → receive `new_bid` in socket |
| Chat connect | Connect to `/chat` with JWT → receive `connected` |
| Chat message | Emit `send_message` → other participant receives `new_message` |

---

## 4. Constants (for client apps)

- **Auction events:** `src/modules/auction/constants/auction-events.constants.ts`
- **Chat events:** `src/modules/chat/constants/chat-events.constants.ts`

Use these same event names on the client so you stay in sync with the server.
