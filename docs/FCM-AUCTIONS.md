# Firebase data-only payloads for auctions

This document explains how auction-related realtime updates are delivered via Firebase data-only push messages. There is no dedicated `/auction` WebSocket anymore; the mobile/Flutter client should listen for FCM data channels and render notifications/UI itself.

## General behavior
- Every auction event is saved to `notifications` table with localized `title`/`message` (browsable history) and also forwarded through Firebase.
- Firebase messages carry only the `data` block (`notification` is omitted), so clients can render custom UI and avoid duplicate system banners when the app is foreground.
- On iOS `aps.content-available: true` is set so data is received even when the app is backgrounded.

## Payload format
Each event includes at least:
```json
{
  "type": "<EVENT_TYPE>",
  "auctionId": "uuid",
  "productId": "uuid",
  "notificationId": "uuid" // optional, added by NotificationService
}
```
Optional fields depend on the event:
- `amount`, `currency` – for `NEW_BID`, `OUTBID`, `BID_REJECTED`.
- `isWinner` – present on `AUCTION_ENDED` to mark whether the recipient won.
- `newEndTime` – present on `AUCTION_EXTENDED` (ISO string).
- `event` – also `AUCTION_EXTENDED` for clients that need to know the sub-type.

### Supported event types
| type | Triggers | Description |
|------|----------|-------------|
| `NEW_BID` | When a new bid is placed | Seller is notified with latest amount/currency.
| `OUTBID` | When a bidder is outbid | Loser receives amount/currency and auctionId.
| `BID_REJECTED` | Seller rejects a bid | Bidder learns why (data-only, UI decides wording). Amount/currency duplicated for context.
| `AUCTION_ENDED` | Auction ended / winner assigned | All participants receive `isWinner` flag; use to update UI.
| `AUCTION_EXTENDED` | Auction auto-extended | All participants get `newEndTime`; client can restart timer.

## Client responsibilities
1. Subscribe to Firebase messaging and call `subscribeToTopic` if needed.
2. Handle data-only message via `onMessage`/`onBackgroundMessage` handlers.
3. Read `type` field and perform one of:
   - Update auction card (price, timer) when `NEW_BID`/`AUCTION_EXTENDED` arrives.
   - Show local toast/banner with custom text when `OUTBID` or `BID_REJECTED` arrives.
   - Navigate to auction detail when `AUCTION_ENDED` for the winner, or refresh list otherwise.
4. Optionally persist `notificationId` for cross-reference with REST history.
5. Ignore system FCM UI since `notification` is empty; render your own local notification if desired.

## Testing tips
- Use Firebase console’s **Send message** (select **Data** only) to mimic backend payloads.
- Confirm APNs background delivery on iOS (content-available true) by sending while app in background.
- Verify `notifications` DB table keeps localized text even though Firebase ignored it.

