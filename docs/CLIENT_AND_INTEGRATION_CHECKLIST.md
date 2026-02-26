# Client app & integration checklist

Use this checklist to align your client app with the Nest backend and to verify **products**, **categories**, **bids**, **auction**, **WebSocket (chat + auction)**, **notifications**, and **Firebase (FCM)**.

Base URL: `{{BASE_URL}}/api/v1` (e.g. `http://localhost:3000/api/v1`).

---

## How to run the test client (`client/`)

1. **Start the backend** (in one terminal):
   ```bash
   npm run start:dev
   ```
   Backend will be at `http://localhost:3000` (or your `PORT`).

2. **Start the client** (in another terminal):
   ```bash
   npm run client
   ```
   This serves the static app in `client/` at **http://localhost:5000**. Open that URL in the browser.

3. **CORS:** If the backend rejects requests from the client, add `http://localhost:5000` to `CORS_ORIGIN` in `.env` (see `.env.example`).

4. **API base:** The client uses `http://localhost:3000` by default. To point to another host, set `window.TEST_APP_API_BASE` before the app loads (e.g. in `index.html`: `<script>window.TEST_APP_API_BASE = 'https://api.example.com';</script>`).

---

## 1. Products

| Check | Endpoint / action | Auth | Notes |
|-------|-------------------|------|--------|
| List products | `GET /products?page=1&limit=20` | Optional | Use `categoryId`, `sellerId`, `salePhase`, `regionId`, `cityId`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`. |
| Get one product | `GET /products/:id` or by slug | Optional | Response includes `activeAuction`, `saleOrderSummary` when relevant. |
| Create product | `POST /products` | JWT | Requires **publicationCredits** ≥ 1 (see profile). Body: categoryId, conditionId, sizeId, location IDs, title, price or auction, imageIds, etc. |
| Update product | `PATCH /products/:id` | JWT (owner/admin) | |
| Sell section | `GET /products?sellerId=<currentUserId>&salePhase=all\|in_auction\|sold\|in_delivery` | JWT | Only current user's products; tabs: All, On auction, Sold, Awaiting delivery. |

---

## 2. Categories

| Check | Endpoint / action | Auth | Notes |
|-------|-------------------|------|--------|
| List categories | `GET /categories` | Public | Use for filters and product create. |
| Get one category | `GET /categories/:id` | Public | |

---

## 3. Bids

| Check | Endpoint / action | Auth | Notes |
|-------|-------------------|------|--------|
| Place bid | `POST /bids` body: `{ auctionId, amount }` | JWT | Validations: not own auction, not platform/auction banned, not blocked by seller, **cooldown 1/min** (400 with seconds left), amount ≥ current + increment. |
| List bids for auction | `GET /bids/auction/:auctionId?view=all\|new\|top\|rejected&page=1&limit=20` | Public | Owner uses `view=new` for unread; `isNew`, `readByOwnerAt` in each bid. |
| Mark one read | `PATCH /bids/:id/read` | JWT (owner) | 204. |
| Mark all read | `PATCH /bids/auction/:auctionId/read-all` | JWT (owner) | 200 `{ markedCount }`. |
| Restore rejected bid | `PATCH /bids/:id/restore` | JWT (owner/admin) | Auction must be ACTIVE. |
| Retract/remove bid | `DELETE /bids/:id` | JWT (bidder/owner/admin) | |
| My bids | `GET /bids/my-bids` | JWT | |

---

## 4. Auction (HTTP)

| Check | Endpoint / action | Auth | Notes |
|-------|-------------------|------|--------|
| Get auction / product | `GET /products/:id` or auction endpoints | Optional | Product includes `activeAuction` (id, endTime, status, currentPrice, totalBids). |
| List auctions | Per product or via product filters | Optional | Products with active auction: use product list with appropriate filters. |

---

## 5. WebSocket – Auction

| Check | Action | Notes |
|-------|--------|--------|
| Connect | Connect to `{{WS_BASE}}/auction` (e.g. `ws://localhost:3000/auction`) with JWT in `Authorization: Bearer <token>` or `auth.token` or query `token`. | On success server emits `connected` with userId, socketId. |
| Join room | Emit `join_auction` with body `{ auctionId }`. | Required to receive events for that auction. |
| Leave | Emit `leave_auction` with `{ auctionId }`. | |
| Events from server | `new_bid`, `outbid`, `bid_rejected`, `auction_updated`, `auction_ended`, `auction_extended`. | Payloads include auctionId, bid or auction, timestamp. |

**Logic:** Place bid via **HTTP** `POST /bids`; real-time updates come over **WebSocket** (new_bid to room, outbid to previous leader). Client must join the auction room to see live bids.

---

## 6. WebSocket – Chat

| Check | Action | Notes |
|-------|--------|--------|
| Connect | Connect to `{{WS_BASE}}/chat` with JWT (same as auction). | Server joins client to all conversation rooms, emits `connected`. |
| Join conversation | Emit `join_conversation` with `{ conversationId }`. | Do this when opening a chat. |
| Send message | Emit `send_message` with `{ conversationId, content, messageType?, fileId?, replyToMessageId? }`. | Server broadcasts `new_message` to room. |
| Typing | Emit `typing_start` / `typing_stop` with `{ conversationId }`. | Server broadcasts `user_typing`. |
| Mark read | Emit `mark_read` with `{ conversationId, messageIds? }`. | Server broadcasts `messages_read`. |
| Events from server | `new_message`, `message_deleted`, `message_edited`, `messages_read`, `user_typing`, `user_presence`. | |

**Logic:** Create conversation via **HTTP** `POST /chat/conversations` (include `productId` for flower when opening from bouquet page). Response has `flowerId`, `participants` (userId, username). Then use WebSocket for messages and typing.

---

## 7. Notifications (HTTP)

| Check | Endpoint / action | Auth | Notes |
|-------|-------------------|------|--------|
| List notifications | `GET /notifications?page=1&limit=20&type=&isRead=` | JWT | Paginated; filter by type, isRead. |
| Unread count | `GET /notifications/unread/count` | JWT | Returns `{ count }` for badge. |
| Get one | `GET /notifications/:id` | JWT | |
| Mark read | `POST /notifications/:id/read` | JWT | 204. |
| Mark all read | `POST /notifications/read-all` | JWT | 200 `{ count }`. |
| Update | `PATCH /notifications/:id` body `{ isRead }` | JWT | |
| Delete | `DELETE /notifications/:id` | JWT | |
| Create (admin) | `POST /notifications` body `{ userId, type, title, message, data? }` | JWT (admin) | |

**Types (examples):** NEW_BID, OUTBID, BID_REJECTED, AUCTION_ENDED, SYSTEM (e.g. new message). Notification preferences (per user) control which types are persisted and sent as push (see Firebase below).

---

## 8. Firebase (FCM) – push notifications

### Backend logic

- **FCM token:** Stored per user. Client must register/update it so the backend can send push.
- **Registration:** `POST /users/fcm-token` with JWT and body `{ fcmToken: string }`. Backend validates format and saves; invalid tokens are cleared on send failure.
- **When push is sent:** For each notification type the backend:
  1. Checks user's **notification preference** (e.g. `newBid`, `outbid`, `newMessage`, `auctionEnded`, etc.) and that `pushEnabled` and `isActive` are true.
  2. Persists the notification (so it appears in GET /notifications).
  3. If user has a valid `fcmToken`, calls **Firebase Admin** to send a push (title, body, data payload with e.g. notificationId, type, auctionId, productId, conversationId).

### Events that trigger FCM (when preferences allow)

| Event | Preference flag | Recipient |
|-------|------------------|-----------|
| New bid on seller's auction | newBid | Seller |
| User outbid | outbid | Previous high bidder |
| Bid rejected by owner | outbid | Bidder |
| Auction ended | auctionEnded | Participants (winner/loser message) |
| New chat message | newMessage | Other participant |
| Admin-created notification | system | Target user |

### Client checklist (Firebase)

1. **Get FCM token** in the client app (Firebase SDK: `getToken()` or similar).
2. **Send to backend** after login: `POST /api/v1/users/fcm-token` with `Authorization: Bearer <accessToken>` and body `{ "fcmToken": "<device token>" }`.
3. **Refresh token** when it changes (e.g. on app start or token refresh callback).
4. **Handle foreground data** when app is open: use `data` payload (notificationId, type, auctionId, productId, conversationId) to navigate or refresh (e.g. open auction, open chat).
5. **Respect notification preferences:** Backend only sends push if user has the corresponding preference enabled; preferences can be exposed in app settings if you add a PATCH preferences API.

### Backend config

- Firebase is optional. If `firebase.projectId`, `firebase.privateKey`, `firebase.clientEmail` are not set, backend logs a warning and skips FCM (notifications are still stored).
- Invalid or unregistered FCM tokens are removed from the user record when a send fails so the backend does not keep retrying.

---

## 9. Quick verification script

Run the backend, then from project root:

```bash
npm run check:backend
```

Or with env vars:

```bash
BASE_URL=http://localhost:3000/api/v1 JWT=<your_jwt> AUCTION_ID=<uuid> npm run check:backend
```

- **Without JWT:** Script checks health, categories, products (public). Skips protected routes and reports "skipped (no JWT)".
- **With JWT:** Also checks notifications, unread count, profile, FCM token update (test token), and optionally bids for an auction if `AUCTION_ID` is set.
- **VERBOSE=1** prints response bodies.

WebSocket (auction and chat) and full Firebase delivery are best tested from the real client app or with a tool that supports Socket.IO and FCM.

---

## 10. Summary

| Area | HTTP | WebSocket | Firebase |
|------|------|-----------|----------|
| Products | GET/POST/PATCH/DELETE /products | — | — |
| Categories | GET /categories | — | — |
| Bids | GET/POST/PATCH/DELETE /bids, read, read-all, restore | — | — |
| Auction | Via products + bids | /auction: join_auction, new_bid, outbid, bid_rejected, auction_ended, etc. | Push for new bid, outbid, bid rejected, auction ended |
| Chat | GET/POST/PATCH /chat/conversations, messages | /chat: join_conversation, send_message, new_message, typing, mark_read | Push for new message |
| Notifications | GET/POST/PATCH/DELETE /notifications, read, read-all | — | All push via FCM when token set and preferences enabled |

Ensure the client uses the same base URL and API version (`/api/v1`), sends JWT for protected routes, and registers the FCM token so push and in-app notification logic stay in sync.
