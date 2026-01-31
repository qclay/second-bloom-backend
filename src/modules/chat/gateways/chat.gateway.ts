import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { ChatMessageResponseDto } from '../dto/message-response.dto';
import { JoinConversationDto } from '../dto/join-conversation.dto';
import { CHAT_EVENTS } from '../constants/chat-events.constants';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin:
      process.env.CORS_ORIGIN === '*'
        ? true
        : process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || [
            'http://localhost:3000',
          ],
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly userConversations = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.setupKeepAlive();
  }

  private setupKeepAlive() {
    setInterval(() => {
      this.server.emit('ping', { timestamp: Date.now() });
    }, 20000);
  }

  private async autoJoinUserConversations(
    client: AuthenticatedSocket,
  ): Promise<void> {
    if (!client.userId) return;

    try {
      const conversations = await this.chatService.getConversations(
        { page: 1, limit: 50 },
        client.userId,
      );

      const conversationIds = conversations.data.map((conv) => conv.id);

      for (const conversationId of conversationIds) {
        await client.join(`conversation:${conversationId}`);
      }

      if (!this.userConversations.has(client.userId)) {
        this.userConversations.set(client.userId, new Set());
      }
      conversationIds.forEach((id) => {
        this.userConversations.get(client.userId!)?.add(id);
      });

      if (conversationIds.length > 0) {
        this.logger.log(
          `User ${client.userId} auto-joined ${conversationIds.length} conversations`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to auto-join conversations for user ${client.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      const userId = payload.sub || payload.id;
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID in token');
      }
      client.userId = userId;
      this.addUserSocket(client.userId, client.id);

      this.logger.log(`Client ${client.id} connected as user ${client.userId}`);

      await this.autoJoinUserConversations(client);

      client.emit(CHAT_EVENTS.CONNECTED, {
        userId: client.userId,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} disconnected: Invalid token - ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.removeUserSocket(client.userId, client.id);
      this.logger.log(
        `Client ${client.id} disconnected (user ${client.userId})`,
      );
    }
  }

  @SubscribeMessage('pong')
  handlePong(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      this.logger.debug(`Received pong from user ${client.userId}`);
    }
  }

  @SubscribeMessage(CHAT_EVENTS.JOIN_CONVERSATION)
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationDto,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    if (!data.conversationId || typeof data.conversationId !== 'string') {
      return { error: 'Invalid conversation ID' };
    }

    try {
      await this.chatService.getConversationById(
        data.conversationId,
        client.userId,
      );

      void client.join(`conversation:${data.conversationId}`);

      if (!this.userConversations.has(client.userId)) {
        this.userConversations.set(client.userId, new Set());
      }
      this.userConversations.get(client.userId)?.add(data.conversationId);

      this.logger.log(
        `User ${client.userId} joined conversation ${data.conversationId}`,
      );

      return { success: true, conversationId: data.conversationId };
    } catch (error) {
      this.logger.error(
        `Error joining conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage(CHAT_EVENTS.LEAVE_CONVERSATION)
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationDto,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    void client.leave(`conversation:${data.conversationId}`);

    const userConvs = this.userConversations.get(client.userId);
    if (userConvs) {
      userConvs.delete(data.conversationId);
      if (userConvs.size === 0) {
        this.userConversations.delete(client.userId);
      }
    }

    this.logger.log(
      `User ${client.userId} left conversation ${data.conversationId}`,
    );

    return { success: true, conversationId: data.conversationId };
  }

  @SubscribeMessage(CHAT_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ): Promise<{
    success: boolean;
    message?: ChatMessageResponseDto;
    error?: string;
  }> {
    if (!client.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.conversationId || !data.content) {
      return { success: false, error: 'Missing required fields' };
    }

    if (data.content.length > 5000) {
      return { success: false, error: 'Message content too long' };
    }

    try {
      const message = await this.chatService.sendMessage(data, client.userId);

      const conversation = await this.chatService.getConversationById(
        data.conversationId,
        client.userId,
      );

      const recipientId =
        conversation.seller.id === client.userId
          ? conversation.buyer.id
          : conversation.seller.id;

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit(CHAT_EVENTS.NEW_MESSAGE, message);

      this.sendToUser(recipientId, CHAT_EVENTS.NEW_MESSAGE, message);

      this.logger.log(
        `Message sent in conversation ${data.conversationId} by user ${client.userId}`,
      );

      return { success: true, message };
    } catch (error) {
      this.logger.error(
        `Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationDto,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    if (!data.conversationId || typeof data.conversationId !== 'string') {
      return { error: 'Invalid conversation ID' };
    }

    client
      .to(`conversation:${data.conversationId}`)
      .emit(CHAT_EVENTS.USER_TYPING, {
        conversationId: data.conversationId,
        userId: client.userId,
        isTyping: true,
      });

    return { success: true };
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationDto,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    if (!data.conversationId || typeof data.conversationId !== 'string') {
      return { error: 'Invalid conversation ID' };
    }

    client
      .to(`conversation:${data.conversationId}`)
      .emit(CHAT_EVENTS.USER_TYPING, {
        conversationId: data.conversationId,
        userId: client.userId,
        isTyping: false,
      });

    return { success: true };
  }

  @SubscribeMessage(CHAT_EVENTS.MARK_READ)
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; messageIds?: string[] },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    if (!data.conversationId || typeof data.conversationId !== 'string') {
      return { error: 'Invalid conversation ID' };
    }

    try {
      const result = await this.chatService.markMessagesAsRead(
        {
          conversationId: data.conversationId,
          messageIds: data.messageIds,
        },
        client.userId,
      );

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit(CHAT_EVENTS.MESSAGES_READ, {
          conversationId: data.conversationId,
          userId: client.userId,
          count: result.count,
        });

      return { success: true, count: result.count };
    } catch (error) {
      this.logger.error(
        `Error marking messages as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage(CHAT_EVENTS.DELETE_MESSAGE)
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ): Promise<{
    success: boolean;
    message?: ChatMessageResponseDto;
    error?: string;
  }> {
    if (!client.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.messageId || typeof data.messageId !== 'string') {
      return { success: false, error: 'Invalid message ID' };
    }

    try {
      const message = await this.chatService.deleteMessage(
        data.messageId,
        client.userId,
      );

      const conversation = await this.chatService.getConversationById(
        message.conversationId,
        client.userId,
      );

      const recipientId =
        conversation.seller.id === client.userId
          ? conversation.buyer.id
          : conversation.seller.id;

      this.server
        .to(`conversation:${message.conversationId}`)
        .emit(CHAT_EVENTS.MESSAGE_DELETED, {
          messageId: message.id,
          conversationId: message.conversationId,
        });

      this.sendToUser(recipientId, CHAT_EVENTS.MESSAGE_DELETED, {
        messageId: message.id,
        conversationId: message.conversationId,
      });

      this.logger.log(
        `Message ${data.messageId} deleted by user ${client.userId}`,
      );

      return { success: true, message };
    } catch (error) {
      this.logger.error(
        `Error deleting message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage(CHAT_EVENTS.EDIT_MESSAGE)
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string },
  ): Promise<{
    success: boolean;
    message?: ChatMessageResponseDto;
    error?: string;
  }> {
    if (!client.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.messageId || !data.content) {
      return { success: false, error: 'Missing required fields' };
    }

    if (data.content.length > 5000) {
      return { success: false, error: 'Message content too long' };
    }

    try {
      const message = await this.chatService.editMessage(
        data.messageId,
        data.content,
        client.userId,
      );

      const conversation = await this.chatService.getConversationById(
        message.conversationId,
        client.userId,
      );

      const recipientId =
        conversation.seller.id === client.userId
          ? conversation.buyer.id
          : conversation.seller.id;

      this.server
        .to(`conversation:${message.conversationId}`)
        .emit(CHAT_EVENTS.MESSAGE_EDITED, message);

      this.sendToUser(recipientId, CHAT_EVENTS.MESSAGE_EDITED, message);

      this.logger.log(
        `Message ${data.messageId} edited by user ${client.userId}`,
      );

      return { success: true, message };
    } catch (error) {
      this.logger.error(
        `Error editing message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  notifyNewMessage(
    conversationId: string,
    message: ChatMessageResponseDto,
    recipientId: string,
  ): void {
    this.sendToUser(recipientId, CHAT_EVENTS.NEW_MESSAGE, message);
    this.server
      .to(`conversation:${conversationId}`)
      .emit(CHAT_EVENTS.NEW_MESSAGE, message);
  }

  notifyMessageRead(
    conversationId: string,
    userId: string,
    count: number,
  ): void {
    this.server
      .to(`conversation:${conversationId}`)
      .emit(CHAT_EVENTS.MESSAGES_READ, {
        conversationId,
        userId,
        count,
      });
  }

  getConnectionCount(): number {
    return this.server.sockets.sockets.size;
  }

  getRoomCount(): number {
    const rooms = new Set<string>();
    this.server.sockets.adapter.rooms.forEach((_, roomName) => {
      if (roomName.startsWith('conversation:')) {
        rooms.add(roomName);
      }
    });
    return rooms.size;
  }

  private sendToUser(userId: string, event: string, data: unknown): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = client.handshake.auth?.token;
    if (token) {
      return token;
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }
}
