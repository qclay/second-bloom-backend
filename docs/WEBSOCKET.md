# WebSocket Documentation

We use **Socket.IO** for real-time features. There are **3 namespaces**. You need a **JWT** to connect.

---

## What are the 3 namespaces?

| Namespace | Use it for |
|-----------|------------|
| **`/auction`** | Live auction page — see new bids, price changes, when auction ends. |
| **`/conversation`** | Chat — send/receive messages, typing, who is online. |
| **`/payment`** | Orders/Top-up page — get notified when a payment succeeds. |

**Base URL:** Same as your API (e.g. `https://api.example.com` or `http://localhost:3000`).

- Auction: connect to `{base}/auction`
- Conversation: connect to `{base}/conversation`
- Payment: connect to `{base}/payment`

---

## How do I connect?

Send your **JWT** when connecting. You can use any of these:

1. **`auth: { token: "YOUR_JWT" }`** — recommended in browser
2. **Header:** `Authorization: Bearer YOUR_JWT`
3. **Query:** `?token=YOUR_JWT`

If the token is wrong or missing, the connection is closed. After a good connection, the server sends you a **`connected`** event with your `userId` and `socketId`.

---

## Namespace: `/auction`

**When to use:** User opened an auction detail page and you want live updates (new bids, price, end time, etc.).

### What you send (requests)

| Event | Payload | What it does |
|-------|---------|--------------|
| `join_auction` | `{ auctionId: "uuid" }` | Subscribe to this auction. You must do this to get any events. |
| `leave_auction` | `{ auctionId: "uuid" }` | Unsubscribe when user leaves the page. |
| `pong` | `{ timestamp: number }` | Optional reply to server `ping` (keepalive). |

**Response:** When you send `join_auction` or `leave_auction`, you get a callback: `{ success: true, auctionId: "..." }` or `{ success: false, error: "..." }`.

### What you receive (responses)

| Event | When | Payload |
|-------|------|---------|
| `connected` | Right after connect | `{ userId, socketId, deviceId?, timestamp }` |
| `ping` | Every ~20 sec | `{ timestamp }` — you can reply with `pong`. |
| `new_bid` | Someone placed a bid | `{ auctionId, bid: { id, amount, bidderId, ... }, timestamp }` |
| `bid_replaced` | Same user raised their bid | `{ auctionId, removedBidIds, newBid, timestamp }` |
| `outbid` | You were outbid (only sent to you) | `{ auctionId, bid, timestamp }` |
| `bid_rejected` | Owner rejected a bid | `{ auctionId, bid, timestamp }` |
| `auction_updated` | Auction data changed | `{ auctionId, auction: { currentPrice, ... }, timestamp }` |
| `auction_ended` | Auction finished | `{ auctionId, auction, winnerId, timestamp }` |
| `auction_extended` | End time was extended | `{ auctionId, newEndTime, reason, timestamp }` |
| `error` | Something went wrong | `{ success: false, error: { code, message }, statusCode }` |

**Flow:** Connect → get `connected` → send `join_auction` with auction ID → listen for events → when user leaves, send `leave_auction`.

---

## Namespace: `/conversation`

**When to use:** User is on the chat screen. Send messages, show typing and read state, show who is online.

### What you send (requests)

| Event | Payload | What it does |
|-------|---------|--------------|
| `join_conversation` | `{ conversationId: "uuid" }` | Join a chat room (e.g. when user opens a thread). |
| `leave_conversation` | `{ conversationId: "uuid" }` | Leave the room. |
| `send_message` | `{ conversationId, content, messageType?, fileId?, replyToMessageId? }` | Send a message. `content` max 5000 chars. |
| `typing_start` | `{ conversationId }` | User started typing. |
| `typing_stop` | `{ conversationId }` | User stopped typing. |
| `mark_read` | `{ conversationId, messageIds? }` | Mark messages as read. |
| `delete_message` | `{ messageId }` | Delete a message. |
| `edit_message` | `{ messageId, content }` | Edit a message. |
| `get_online_status` | `{ userIds: ["id1", "id2"] }` | Ask who is online. Callback returns `{ statuses: { userId: true/false } }`. |

**Responses:** Most events return a callback like `{ success: true, message?: {...} }` or `{ success: false, error: "..." }`.

### What you receive (responses)

| Event | When | Payload |
|-------|------|---------|
| `connected` | Right after connect | `{ userId, socketId, timestamp }` |
| `new_message` | New message in a chat you're in | Full message object (id, content, sender, createdAt, ...) |
| `message_deleted` | A message was deleted | `{ messageId, conversationId }` |
| `message_edited` | A message was edited | Full updated message. |
| `user_typing` | Someone is typing / stopped | `{ conversationId, userId, isTyping }` |
| `messages_read` | Messages marked as read | `{ conversationId, userId?, count? }` |
| `user_presence` | Someone came online or offline | `{ userId, isOnline, timestamp }` |
| `ping` | Keepalive | — (you can send `pong`) |
| `error` | Something went wrong | `{ success: false, error: { code, message } }` |

**Flow:** Connect → get `connected` → when user opens a chat, send `join_conversation` → use `send_message` to send; listen for `new_message`, `user_typing`, `messages_read` to update the UI.

---

## Namespace: `/payment`

**When to use:** User is on Orders or Top-up page. You only **listen**; no need to send any events.

### What you send

Nothing. Just connect and listen.

### What you receive (responses)

| Event | When | Payload |
|-------|------|---------|
| `connected` | Right after connect | `{ userId, socketId, timestamp }` |
| `payment_success` | User's payment completed (e.g. top-up or buy credits) | `{ paymentId, amount, paymentType, quantity?, balanceAdded?, creditsAdded?, timestamp }` |

**Flow:** Connect when user is on Orders/Top-up → when you get `payment_success`, refresh balance and payment history (e.g. call your API) and show a success message.

---

## Small example (auction)

```javascript
const socket = io('https://api.example.com/auction', {
  auth: { token: myJwt },
  transports: ['websocket', 'polling'],
});

socket.on('connected', (data) => {
  console.log('Connected as', data.userId);
  socket.emit('join_auction', { auctionId: 'abc-123' }, (res) => {
    if (res.success) console.log('Joined auction');
  });
});

socket.on('new_bid', (data) => {
  console.log('New bid:', data.bid.amount);
});
socket.on('auction_ended', (data) => {
  console.log('Auction ended, winner:', data.winnerId);
});
```

---

## Errors

- **Connection closes immediately:** Bad or missing JWT. Use a valid token.
- **`error` event:** Server sends `{ success: false, error: { code, message } }`. Check the message.
- **Callback with `error`:** When you send an event (e.g. `join_auction`, `send_message`), the callback may return `{ success: false, error: "..." }`. Show that to the user or fix the request.

---

## Summary

| Namespace | You send | You receive |
|-----------|----------|-------------|
| `/auction` | `join_auction`, `leave_auction`, `pong` | `new_bid`, `bid_replaced`, `outbid`, `auction_ended`, `auction_updated`, `auction_extended`, `bid_rejected` |
| `/conversation` | `join_conversation`, `send_message`, `typing_start`/`typing_stop`, `mark_read`, `get_online_status`, etc. | `new_message`, `user_typing`, `messages_read`, `user_presence`, `message_deleted`, `message_edited` |
| `/payment` | — | `payment_success` |

Connect to `{your-api-host}/{namespace}` with JWT in `auth.token`, and you're done.
