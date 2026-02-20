# Platform flows, APIs, WebSockets & FAQ

This document describes **Locations**, **Products**, **Orders**, **Bids**, **Auctions**, **Conversations (Chat)**, **Reviews**, **Publication Pricing**, the **buy flow**, WebSocket usage, error logic, and answers to common requirements.

---

## Table of contents

1. [Locations](#1-locations)
2. [Products](#2-products)
3. [Orders](#3-orders)
4. [Bids](#4-bids)
5. [Auctions & WebSocket](#5-auctions--websocket)
6. [Conversations (Chat)](#6-conversations-chat)
7. [Reviews](#7-reviews)
8. [Publication Pricing](#8-publication-pricing)
9. [Full buy flow](#9-full-buy-flow)
10. [Answers to requirements (1–9)](#10-answers-to-requirements-19)

---

## 1. Locations

**Purpose:** Hierarchical geography: **Country → Region → City → District**. Used for product location and filters. Data is small (few cities), so you can load it from the backend.

### HTTP API (all public, no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/locations/countries` | List active countries |
| GET | `/locations/regions` | List regions. Query: `?countryId=...` (optional) |
| GET | `/locations/cities` | List cities. Query: `?regionId=...` (optional) |
| GET | `/locations/districts` | List districts. Query: `?cityId=...` (optional) |

### Response shape (conceptually)

- **Country:** `id`, `name` (can be i18n object), `code`
- **Region:** `id`, `name`, `countryId`
- **City:** `id`, `name`, `regionId`
- **District:** `id`, `name`, `cityId`

Names may be translation records (e.g. `{ en, ru, uz }`); the response interceptor can resolve them by `Accept-Language`.

### Flow

1. Load countries once (e.g. on app init or product form).
2. When user picks a country → load regions with `?countryId=...`.
3. When user picks a region → load cities with `?regionId=...`.
4. When user picks a city → load districts with `?cityId=...`.
5. When creating/editing a product, send `countryId`, `regionId`, `cityId`, `districtId` (UUIDs). Product response includes resolved `region`, `city`, `district` text for display.

### Errors

- No specific error codes for locations; 404 only if IDs are invalid elsewhere (e.g. product create with wrong `regionId`).

---

## 2. Products

**Purpose:** Listings (e.g. bouquets). Can be fixed-price or auction. Seller is set by auth; location by location IDs.

### Main HTTP API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/products` | JWT | Create product (and optionally auction). Checks **publication credits**. |
| GET | `/products` | Optional | List/search. Query: `search`, `categoryId`, `sellerId`, `salePhase`, `regionId`, `cityId`, `districtId`, `minPrice`, `maxPrice`, `page`, `limit`, `sortBy`, `sortOrder` |
| GET | `/products/:id` | Optional | Get one product (by id or slug) |
| PATCH | `/products/:id` | JWT | Update (owner/admin) |
| DELETE | `/products/:id` | JWT | Soft-delete (owner/admin) |

### Publication credits (requirement 8)

- **Before create:** Backend loads user’s `publicationCredits` (and role).
- If role is not ADMIN and `publicationCredits < 1` → **400 Bad Request:**  
  `"Insufficient publication credits. Please purchase credits to create a product."`
- On success, backend decrements `publicationCredits` by 1 (admins may be excluded). User profile includes `balance` and `publicationCredits` so the client can show “X publications left”.

### Sell section (requirement 9)

Use **same** `GET /products` with **`sellerId` = current user** and **`salePhase`**:

| `salePhase` | Meaning | Backend logic |
|------------|--------|----------------|
| `all` | All my bouquets | All products for `sellerId`, no extra filter |
| `in_auction` | On auction | Products that have an **ACTIVE** auction (endTime ≥ now, not deleted) |
| `sold` | Sold | Products that either have an order with status **DELIVERED** or an auction with status **ENDED** |
| `in_delivery` | Awaiting delivery | Products that have an order with status **CONFIRMED**, **PROCESSING**, or **SHIPPED** (not yet DELIVERED) |

So: **only the current user’s products**; tabs are “All”, “On auction”, “Sold”, “Awaiting delivery”.

### Card information by tab

- **List response** always can include: `id`, `title`, `slug`, `price`, `currency`, `category`, `seller`, `images`, `region`, `city`, `district`, `status`, `activeAuction`, etc.
- When **`salePhase`** is `sold` or `in_delivery`, the backend attaches **`saleOrderSummary`** to each product:
  - `orderId`, `status`, `deliveredAt`, `shippedAt`
- When product has an active auction: **`activeAuction`** with `id`, `endTime`, `status`, `currentPrice`, `totalBids`.

So in the Sell section, cards can show different info: e.g. “In delivery” with order status and shipped/delivered dates; “Sold” with last order status and delivered date.

### Location on product

- Create/update use **`countryId`, `regionId`, `cityId`, `districtId`** (from locations API).
- Response includes resolved **`region`, `city`, `district`** (and optionally country) for display.

### Errors (examples)

- 404: Product/category/condition/size not found.
- 400: No publication credits; price/auction validation; minPrice > maxPrice.
- 403: Not owner/admin on update/delete.

---

## 3. Orders

**Purpose:** Purchase of a product — either **direct** (fixed price) or **after winning an auction**.

### Order statuses

- `PENDING` — created, not yet confirmed
- `CONFIRMED` — seller confirmed
- `PROCESSING` — being prepared
- `SHIPPED` — sent
- `DELIVERED` — completed
- `CANCELLED`

### Main HTTP API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | JWT | Create order. Body: `productId`, `amount`, optional `auctionId` (if from auction). Validations: product exists and ACTIVE; if auctionId, auction must be ENDED and buyer must be winner; amount must match winning bid or product price. |
| GET | `/orders` | JWT | List orders (buyer/seller). Query: `status`, `page`, `limit`, etc. |
| GET | `/orders/:id` | JWT | Get one order |
| PATCH | `/orders/:id` | JWT | Update order (e.g. status) — allowed transitions enforced |

### Flow in buy journey

- **Direct buy:** User pays at product price → create order with `productId` + `amount` = product price.
- **Auction win:** After auction ends, winner creates order with `productId`, `auctionId`, `amount` = winning bid. Then payment/delivery flow.

### Errors

- 404: Product/auction not found.
- 400: Product not ACTIVE; auction not ENDED; amount mismatch; order already exists for this auction.
- 403: Only auction winner can create order for that auction; cannot buy own product.

---

## 4. Bids

**Purpose:** Place and manage bids on auctions. Includes **cooldown**, **blocked user**, **auction ban**, **platform ban**, **new/viewed** state, **restore**, and **sorting**.

### Main HTTP API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bids` | JWT | Place bid. Body: `auctionId`, `amount`. Validations below. |
| GET | `/bids/auction/:auctionId` | Public | List bids for auction. Query: `view`, `page`, `limit`. **view:** `all`, `new`, `top`, `rejected` |
| GET | `/bids/my-bids` | JWT | Current user’s bids |
| GET | `/bids/:id` | Public | Get one bid |
| PATCH | `/bids/:id/read` | JWT | Mark bid as read (auction owner) — 204 |
| PATCH | `/bids/auction/:auctionId/read-all` | JWT | Mark all new bids in auction as read (owner) — 200 `{ markedCount }` |
| PATCH | `/bids/:id/restore` | JWT | Restore a rejected bid (owner/admin); auction must still be ACTIVE |
| DELETE | `/bids/:id` | JWT | Retract/remove bid (bidder/owner/admin); auction must be ACTIVE |

### Validations when placing a bid (POST /bids)

1. **Auction:** Exists, not deleted, status ACTIVE, endTime > now.
2. **Own auction:** 403 — "You cannot bid on your own auction".
3. **Platform ban:** If user has `auctionBannedUntil` and it’s in the future → 403 with message including ban end date.
4. **Auction ban:** If this user has **≥ 2 rejected bids** in **this auction** → 403 — "You can no longer participate in this auction because your bids were rejected twice by the seller."
5. **Blocked:** If bidder is blocked by auction owner in a conversation → 403 — "You cannot participate in this auction. The seller has restricted your access."
6. **Cooldown:** One bid per minute per user per auction. If last **non-retracted, non-rejected** bid was &lt; 60s ago → **400** — "You can place your next bid in X second(s). One bid per minute per auction." (X = seconds left.)
7. **Amount:** ≥ minBidAmount and ≥ currentPrice + bidIncrement; otherwise 400.

### New / viewed state (requirement 5)

- Each bid has **`readByOwnerAt`** (null = not read by owner) and **`isNew`**: `true` when `readByOwnerAt == null && rejectedAt == null`.
- **List** `GET /bids/auction/:auctionId?view=new` returns only **new** (unread, not rejected) bids.
- Owner can:
  - Mark one as read: **PATCH /bids/:id/read**
  - Mark all in auction as read: **PATCH /bids/auction/:auctionId/read-all**
- Backend **sends** these states in the list and in single-bid response; no extra “sending” step — the client uses `isNew` and `readByOwnerAt` from the API.

### Restore (requirement 6)

- **PATCH /bids/:id/restore** — only auction **owner** (or admin). Clears `rejectedAt`/`rejectedBy`/`isRetracted`, recomputes winning bid. Bid becomes valid again in that auction (subject to cooldown/ban rules on next bid).

### Sorting / views (requirement 7)

- **view** on **GET /bids/auction/:auctionId**:
  - **`all`** — all bids, last on top (default).
  - **`new`** — only unread, not rejected (for “New” tab).
  - **`top`** — by amount descending (highest first).
  - **`rejected`** — only owner-rejected bids.
- So: **New**, **Rejected**, **Top** (and All) are supported.

### Errors (summary)

- 400: Cooldown (with seconds left); amount too low; auction not active/ended; bid already retracted/rejected when restoring.
- 403: Own auction; platform ban; auction ban (2 rejections); blocked by seller; not owner on restore/read.
- 404: Auction/bid not found.

---

## 5. Auctions & WebSocket

**Purpose:** Real-time updates for a specific auction: new bid, outbid, bid rejected, auction updated/ended/extended.

### WebSocket connection

- **Namespace:** `/auction` (e.g. `ws://host/auction`).
- **Auth:** JWT via handshake: `Authorization: Bearer <token>`, or `auth.token`, or query `token`.
- On success, server emits **`connected`** with `userId`, `socketId`, `timestamp`.

### Client → Server (subscribe)

- **`join_auction`** — payload `{ auctionId }`. Client joins room `auction:{auctionId}`. Response: `{ success: true, auctionId }` or `{ success: false, error }`.
- **`leave_auction`** — payload `{ auctionId }`.

To see live updates for an auction, the client must **join_auction** after connecting.

### Server → Client (events)

| Event | When | Payload (conceptually) |
|-------|------|--------------------------|
| `new_bid` | Someone placed a bid | `auctionId`, `bid`, `timestamp` |
| `outbid` | User was outbid | `auctionId`, `bid`, `timestamp` (sent to previous high bidder) |
| `bid_rejected` | Owner rejected a bid | `auctionId`, `bid`, `timestamp` (to rejected user and to room) |
| `auction_updated` | Auction data changed | `auctionId`, `auction`, `timestamp` |
| `auction_ended` | Auction ended | `auctionId`, `auction`, `winnerId`, `timestamp` |
| `auction_extended` | End time extended | `auctionId`, `newEndTime`, `timestamp` |

Bids are placed via **HTTP POST /bids**; WebSocket only pushes events. So: place bid with HTTP → server broadcasts `new_bid` and sends `outbid` to previous leader.

### Errors (WebSocket)

- Connection closed if token missing/invalid.
- `join_auction` can return `success: false, error: 'Invalid auction ID'` or similar.

---

## 6. Conversations (Chat)

**Purpose:** 1‑to‑1 chat with **user_id**, **username**, **flower_id** (which bouquet), plus optional pinned order. When opening chat from a bouquet page, pass that product so the backend can pin it.

### HTTP API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat/conversations` | JWT | Create conversation. Body: **`otherUserId`**, optional **`initialMessage`**, optional **`productId`** (flower), optional **`orderId`**. |
| GET | `/chat/users` | JWT | Users you can chat with (for “start chat”) |
| GET | `/chat/conversations` | JWT | List conversations. Query: `page`, `limit`, `archived` |
| GET | `/chat/conversations/:id` | JWT | Get one conversation |
| PATCH | `/chat/conversations/:id` | JWT | Update: archive, block, or pin product/order |
| GET | `/chat/conversations/:conversationId/messages` | JWT | Paginated messages (cursor) |
| GET | `/chat/conversations/:conversationId/unread-count` | JWT | Unread count for that conversation |
| GET | `/chat/unread-count` | JWT | Total unread |
| DELETE | `/chat/messages/:id` | JWT | Delete own message |

### user_id, username, flower_id (requirement 4)

- **Conversation response** includes **`participants`**: each has **`userId`**, **`username`**, `phoneNumber`, `firstName`, `lastName`, `avatarUrl`. So you always have **user_id** and **username**.
- **`flowerId`** in conversation response = pinned product ID (the bouquet this chat is about). It comes from **`productId`** when creating or updating the conversation.
- **Flow from bouquet page:** When user opens chat from a product page, call **POST /chat/conversations** with **`otherUserId`** (e.g. seller) and **`productId`** (that bouquet). Backend pins the product; one participant must be the product seller. Response then includes **`flowerId`** (= productId) and **`pinnedProduct`** (id, slug, title, price, imageUrl, etc.). So the client “remembers” the bouquet by sending it once at create; later GET conversation returns **flowerId** and **user_id** / **username**.

### WebSocket (Chat)

- **Namespace:** `/chat`.
- **Auth:** JWT (same as auction).
- On connect, server joins the client to all their conversation rooms and emits **`connected`**.

### Client → Server (chat)

- **`join_conversation`** — `{ conversationId }`. Join one room (e.g. when opening that chat).
- **`leave_conversation`** — `{ conversationId }`.
- **`send_message`** — `{ conversationId, content, messageType?, fileId?, replyToMessageId? }`. Max length 5000. Server saves and broadcasts **`new_message`** to the room.
- **`typing_start`** / **`typing_stop`** — `{ conversationId }`. Server broadcasts **`user_typing`** with `userId`, `isTyping`.
- **`mark_read`** — `{ conversationId, messageIds? }`. Server updates read state and broadcasts **`messages_read`**.
- **`delete_message`** — `{ messageId }`. Server broadcasts **`message_deleted`**.
- **`edit_message`** — `{ messageId, content }`. Server broadcasts **`message_edited`**.

### Server → Client (chat)

- **`new_message`** — full message object.
- **`message_deleted`** — `messageId`, `conversationId`.
- **`message_edited`** — full message.
- **`messages_read`** — `conversationId`, `userId`, `count`.
- **`user_typing`** — `conversationId`, `userId`, `isTyping`.
- **`user_presence`** — `userId`, `isOnline`, `timestamp` (when user connects/disconnects).

### Errors (chat)

- 400: Cannot chat with yourself; product/order pin validation (e.g. participant must be seller).
- 403: Not a participant; blocked.
- 404: Conversation/message not found.

---

## 7. Reviews

**Purpose:** Rate seller/buyer after order (e.g. after delivery).

### HTTP API (typical)

- POST `/reviews` — create (orderId, rating, comment, etc.).
- GET `/reviews` — list (e.g. by product, seller, order).
- GET `/reviews/:id` — one review.
- PATCH `/reviews/:id` — update own.
- DELETE `/reviews/:id` — delete own (or admin).

Exact DTOs and rules (e.g. one review per order, only after DELIVERED) depend on your review service implementation; the flow is: order DELIVERED → create review → optionally show in product/seller profile.

---

## 8. Publication Pricing & User balance

**Purpose:** Price per publication (post), and user **balance** / **publication credits** for checking and use (e.g. before creating a product).

### User profile API — balance and publication credits

- **GET /users/profile** (or your auth/profile endpoint) returns the **current user profile**, including:
  - **`balance`** — user balance (e.g. UZS) for purchases and top-ups.
  - **`publicationCredits`** — number of publication credits (used when creating a product).
- Use this **user profile API** to **check** balance and credits before showing “Create product” or “Buy credits”, and to **display** them in the app (e.g. “X publications left”, “Balance: Y”).

### Publication pricing API (internal)

- **GET /settings/publication-price** or **GET /settings/publication-pricing** — **internal** API. Returns current active publication price (e.g. `pricePerPost`, `currency`, `description`). Use to show “Cost per post” before creating a product or buying credits.
- **GET /settings/publication-pricing/all** — all pricing rows (admin).

### Payment for publication: internal vs external API

Paying for publications uses **our backend** to create the payment record and to receive the result, and an **external payment gateway API** (e.g. Click, Payme) to show the payment page and process the charge.

**1. Get the price (internal)**  
- **GET /api/v1/settings/publication-price** — no auth required (or as per your settings). Returns how much one post costs. Use this to display the amount before “Buy publications”.

**2. Create payment record (internal)**  
- **POST /api/v1/payments** — **JWT required.**  
- Body example for publications: `{ "quantity": 1, "gateway": "CLICK" }` (or `"PAYME"`). For type PUBLICATION, `quantity` = number of posts to buy.  
- Backend loads publication pricing, computes `amount = pricePerPost * quantity`, creates a **Payment** record (status PENDING), and returns:
  - **paymentId** — our payment/order id (use as `order_id` when calling the external API).
  - **invoiceUrl** — base URL of the **external** payment service (e.g. `https://backend.secondbloom.uz/api/payment/create-invoice`).
  - **amount**, **quantity**, **paymentType**, optionally **pricePerPost**.

**3. Create invoice / get redirect URL (external API)**  
- The **last step** that involves an **external API** is calling the gateway’s **create-invoice** endpoint.  
- **Method:** POST to the URL you got as **invoiceUrl** (e.g. `{{invoiceUrl}}` or `https://.../api/payment/create-invoice/`).  
- **Body (example):**
  - `amount` — same as returned from POST /payments (e.g. 1000 or the actual total in smallest currency unit, as the gateway expects).
  - `meta_data` — e.g. `{ "order_id": "<paymentId>", "order_type": "posts", "description": "Payment for services" }` (use the **paymentId** from step 2).
  - `gateway` — e.g. `"click"` (must match the gateway chosen in step 2).
  - `webhook_url` — **your backend** webhook URL so the gateway can notify success/failure, e.g. `https://your-backend.com/api/v1/payments/webhook`.
- The **external** API responds with the payment/redirect URL; send the user to that URL to complete payment (Click/Payme page).

**4. Webhook: gateway notifies our backend (internal endpoint, called by external gateway)**  
- When the user has paid (or payment fails), the **external gateway** calls **our** endpoint: **POST /api/v1/payments/webhook**.  
- Request: header **x-signature** (HMAC for verification), body with gateway payload (e.g. `invoice_id`, `status`, `amount`).  
- Our backend verifies the signature, finds the payment (e.g. by invoice_id / amount), updates status to COMPLETED (or FAILED), and on **success** **increments** the user’s **publicationCredits** by `payment.quantity`.  
- No client action needed; after that, GET /users/profile will show the updated **publicationCredits**.

**Summary**

| Step | Who calls | API | Internal / External |
|------|-----------|-----|----------------------|
| Get publication price | App | GET /api/v1/settings/publication-price | Internal |
| Create payment (get paymentId, invoiceUrl, amount) | App | POST /api/v1/payments | Internal |
| Get redirect URL for user to pay | App (or backend proxy) | POST to **invoiceUrl** (create-invoice) | **External** |
| Gateway notifies result | Gateway | POST /api/v1/payments/webhook → our backend | Our endpoint; caller is external |

Flow: Get **profile** (balance, publicationCredits) and **publication-price** → show user their credits and price → user chooses “Buy publications” → **POST /payments** (internal) → call **external create-invoice** with paymentId, amount, webhook_url → redirect user to gateway → user pays → gateway calls **our webhook** → we credit **publicationCredits** → user can create product.

---

## 9. Full buy flow

End‑to‑end path to “buy” (auction or direct).

### Auction path

1. **Browse:** GET /products (and GET /locations/cities etc. for filters).
2. **Product page:** GET /products/:id — includes **activeAuction** (id, endTime, currentPrice, totalBids).
3. **Real-time:** Connect to WebSocket **/auction**, **join_auction** with `activeAuction.id`. Listen for **new_bid**, **outbid**, **auction_ended**, **auction_extended**.
4. **Place bid:** POST /bids with `auctionId`, `amount`. If 400 cooldown, show “Next bid in X seconds”. If 403 (blocked/ban), show corresponding message.
5. **Auction ends:** On **auction_ended**, winner gets winnerId. Winner creates order: POST /orders with `productId`, `auctionId`, `amount` = winning bid.
6. **Payment:** Use payment flow (balance or gateway); on success, order status can move to CONFIRMED etc.
7. **Delivery:** Seller updates order status (PROCESSING → SHIPPED → DELIVERED). Client can show status in “Sell” section and in order detail.
8. **Review:** After DELIVERED, POST /reviews for that order (if your API allows).

### Direct (fixed-price) path

1. **Browse:** GET /products.
2. **Product page:** GET /products/:id (no activeAuction).
3. **Buy:** POST /orders with `productId`, `amount` = product price.
4. Payment and delivery same as above.

### Chat about a bouquet

1. From product page, “Contact seller” or “Chat”: POST /chat/conversations with **otherUserId** = seller, **productId** = current product (flower).
2. Backend returns conversation with **flowerId**, **participants** (userId, username). Open chat UI; connect to **/chat** WebSocket, **join_conversation**, **send_message** as needed.

---

## 10. Answers to requirements (1–9)

| # | Requirement | Answer |
|---|-------------|--------|
| **1** | Request to our cities database; we have few | Use **GET /locations/countries**, **GET /locations/regions** (optional ?countryId), **GET /locations/cities** (?regionId), **GET /locations/districts** (?cityId). All public. Small dataset — load once or on demand. |
| **2** | Bid timer: one bid per minute; error if before 0 | Backend enforces **1 bid per minute per user per auction**. If user bids again before 60s, response is **400**: "You can place your next bid in X second(s). One bid per minute per auction." (X = 1–59.) Use this to drive a 60s countdown in the UI. |
| **3** | Blocked user cannot participate in auction | If the bidder is **blocked by the auction owner** in a conversation, POST /bids returns **403**: "You cannot participate in this auction. The seller has restricted your access." |
| **4** | Chat: user_id, username, flower_id; open from bouquet and pass to backend | Conversation response has **participants** with **userId** and **username**. **flowerId** = pinned product (bouquet). When opening chat from bouquet page, call **POST /chat/conversations** with **otherUserId** and **productId** (that bouquet). Backend stores pin; response includes **flowerId** and **pinnedProduct**. |
| **5** | Backend sends new/viewed states on Applications (bids) page | Each bid has **isNew** (true if unread and not rejected) and **readByOwnerAt**. List **GET /bids/auction/:auctionId** returns these. Use **?view=new** for “New” tab. Owner marks read via **PATCH /bids/:id/read** or **PATCH /bids/auction/:auctionId/read-all**. So backend “sends” these states in the list and single-bid responses. |
| **6** | Owner can return (restore) a bid if they removed it | **PATCH /bids/:id/restore** — auction owner (or admin) can restore a previously rejected bid. Auction must still be ACTIVE. Clears rejectedAt/rejectedBy/isRetracted and recomputes winner. |
| **7** | Sorting for applications: New, Rejected, Top | **GET /bids/auction/:auctionId?view=...**: **new** = unread not rejected, **rejected** = owner-rejected, **top** = highest amount first, **all** = all (last on top). So New, Rejected, Top (and All) are supported. |
| **8** | Check user balance and publication credits | Get **balance** and **publicationCredits** from the **user profile API** (e.g. **GET /users/profile**). Use them to check and display before creating a product or buying credits. On **POST /products**, backend also checks **publicationCredits ≥ 1** (admins can bypass); otherwise **400**: "Insufficient publication credits. Please purchase credits to create a product." |
| **9** | Sell section: All / On auction / Sold / Awaiting delivery; different card info | Use **GET /products?sellerId=&lt;currentUserId&gt;&salePhase=all|in_auction|sold|in_delivery**. **all** = all my products; **in_auction** = with active auction; **sold** = order DELIVERED or auction ENDED; **in_delivery** = order CONFIRMED/PROCESSING/SHIPPED. For **sold** and **in_delivery**, each product has **saleOrderSummary** (orderId, status, deliveredAt, shippedAt) for card details. |

---

## Quick reference: statuses and enums

- **OrderStatus:** PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED  
- **Auction status:** ACTIVE, ENDED (etc.)  
- **Bid view:** all, new, top, rejected  
- **salePhase:** all, in_auction, sold, in_delivery  

Use this doc together with Swagger (`/api` or `/docs`) for exact request/response shapes and error response format.
