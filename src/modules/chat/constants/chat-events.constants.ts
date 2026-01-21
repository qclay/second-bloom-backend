export const CHAT_EVENTS = {
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  SEND_MESSAGE: 'send_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  MARK_READ: 'mark_read',
  DELETE_MESSAGE: 'delete_message',
  EDIT_MESSAGE: 'edit_message',
  PONG: 'pong',

  CONNECTED: 'connected',
  NEW_MESSAGE: 'new_message',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_EDITED: 'message_edited',
  USER_TYPING: 'user_typing',
  MESSAGES_READ: 'messages_read',
  PING: 'ping',
  ERROR: 'error',
} as const;

export type ChatEvent = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];
