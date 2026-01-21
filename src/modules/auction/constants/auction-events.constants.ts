export const AUCTION_EVENTS = {
  JOIN_AUCTION: 'join_auction',
  LEAVE_AUCTION: 'leave_auction',
  SUBSCRIBE_AUCTION: 'subscribe_auction',
  PONG: 'pong',

  CONNECTED: 'connected',
  NEW_BID: 'new_bid',
  AUCTION_UPDATED: 'auction_updated',
  AUCTION_ENDED: 'auction_ended',
  AUCTION_EXTENDED: 'auction_extended',
  OUTBID: 'outbid',
  PING: 'ping',
  ERROR: 'error',
} as const;

export type AuctionEvent = (typeof AUCTION_EVENTS)[keyof typeof AUCTION_EVENTS];
