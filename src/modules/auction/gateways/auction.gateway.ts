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
import { BidResponseDto } from '../../bid/dto/bid-response.dto';
import { AuctionResponseDto } from '../dto/auction-response.dto';
import { JoinAuctionDto } from '../dto/join-auction.dto';
import { AUCTION_EVENTS } from '../constants/auction-events.constants';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  deviceId?: string;
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
  namespace: '/auction',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AuctionGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly auctionRooms = new Map<string, Set<string>>();
  private readonly userAuctions = new Map<string, Set<string>>();
  private readonly socketMetadata = new Map<
    string,
    {
      userId: string;
      deviceId?: string;
      userAgent?: string;
      ipAddress?: string;
      platform?: string;
      connectedAt: number;
      lastActivity: number;
    }
  >();

  constructor(
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

      const deviceInfo = this.extractDeviceInfo(client);
      client.deviceId = deviceInfo.deviceId;

      this.addUserSocket(client.userId, client.id);
      this.socketMetadata.set(client.id, {
        userId: client.userId,
        deviceId: deviceInfo.deviceId,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        platform: deviceInfo.platform,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
      });

      this.logger.log(
        `Client ${client.id} connected as user ${client.userId} from ${deviceInfo.platform || 'unknown'} (${deviceInfo.ipAddress || 'unknown IP'})`,
      );
      client.emit(AUCTION_EVENTS.CONNECTED, {
        userId: client.userId,
        socketId: client.id,
        deviceId: deviceInfo.deviceId,
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
      const userId = client.userId;
      this.removeUserSocket(userId, client.id);
      this.socketMetadata.delete(client.id);
      const userAuctionList = this.userAuctions.get(userId);
      if (userAuctionList) {
        userAuctionList.forEach((auctionId) => {
          const users = this.auctionRooms.get(auctionId);
          if (users) {
            users.delete(userId);
            if (users.size === 0) {
              this.auctionRooms.delete(auctionId);
            }
          }
        });
        this.userAuctions.delete(userId);
      }
      this.logger.log(`Client ${client.id} disconnected (user ${userId})`);
    }
  }

  @SubscribeMessage('pong')
  handlePong(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      this.logger.debug(`Received pong from user ${client.userId}`);
    }
  }

  @SubscribeMessage(AUCTION_EVENTS.JOIN_AUCTION)
  async handleJoinAuction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinAuctionDto,
  ): Promise<{
    success: boolean;
    auctionId?: string;
    error?: string;
  }> {
    if (!client.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.auctionId || typeof data.auctionId !== 'string') {
      return { success: false, error: 'Invalid auction ID' };
    }

    try {
      const roomName = `auction:${data.auctionId}`;
      await client.join(roomName);

      if (!this.auctionRooms.has(data.auctionId)) {
        this.auctionRooms.set(data.auctionId, new Set());
      }
      this.auctionRooms.get(data.auctionId)?.add(client.userId);

      if (!this.userAuctions.has(client.userId)) {
        this.userAuctions.set(client.userId, new Set());
      }
      this.userAuctions.get(client.userId)?.add(data.auctionId);

      this.logger.log(`User ${client.userId} joined auction ${data.auctionId}`);

      return { success: true, auctionId: data.auctionId };
    } catch (error) {
      this.logger.error(
        `Error joining auction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage(AUCTION_EVENTS.LEAVE_AUCTION)
  handleLeaveAuction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinAuctionDto,
  ): Promise<{
    success: boolean;
    auctionId?: string;
    error?: string;
  }> {
    if (!client.userId) {
      return Promise.resolve({ success: false, error: 'Unauthorized' });
    }

    if (!data.auctionId || typeof data.auctionId !== 'string') {
      return Promise.resolve({ success: false, error: 'Invalid auction ID' });
    }

    const roomName = `auction:${data.auctionId}`;
    void client.leave(roomName);

    const users = this.auctionRooms.get(data.auctionId);
    if (users) {
      users.delete(client.userId);
      if (users.size === 0) {
        this.auctionRooms.delete(data.auctionId);
      }
    }

    const userAuctionList = this.userAuctions.get(client.userId);
    if (userAuctionList) {
      userAuctionList.delete(data.auctionId);
      if (userAuctionList.size === 0) {
        this.userAuctions.delete(client.userId);
      }
    }

    this.logger.log(`User ${client.userId} left auction ${data.auctionId}`);

    return Promise.resolve({ success: true, auctionId: data.auctionId });
  }

  notifyNewBid(auctionId: string, bid: BidResponseDto): void {
    this.server.to(`auction:${auctionId}`).emit(AUCTION_EVENTS.NEW_BID, {
      auctionId,
      bid,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `New bid notification sent for auction ${auctionId}, bid ${bid.id}`,
    );
  }

  notifyOutbid(userId: string, auctionId: string, bid: BidResponseDto): void {
    this.sendToUser(userId, AUCTION_EVENTS.OUTBID, {
      auctionId,
      bid,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Outbid notification sent to user ${userId} for auction ${auctionId}`,
    );
  }

  notifyAuctionUpdated(auctionId: string, auction: AuctionResponseDto): void {
    this.server
      .to(`auction:${auctionId}`)
      .emit(AUCTION_EVENTS.AUCTION_UPDATED, {
        auctionId,
        auction,
        timestamp: new Date().toISOString(),
      });

    this.logger.log(
      `Auction updated notification sent for auction ${auctionId}`,
    );
  }

  notifyAuctionEnded(
    auctionId: string,
    auction: AuctionResponseDto,
    winnerId?: string | null,
  ): void {
    this.server.to(`auction:${auctionId}`).emit(AUCTION_EVENTS.AUCTION_ENDED, {
      auctionId,
      auction,
      winnerId,
      timestamp: new Date().toISOString(),
    });

    this.auctionRooms.delete(auctionId);

    this.logger.log(`Auction ended notification sent for auction ${auctionId}`);
  }

  notifyAuctionExtended(
    auctionId: string,
    newEndTime: Date,
    reason: string,
  ): void {
    this.server
      .to(`auction:${auctionId}`)
      .emit(AUCTION_EVENTS.AUCTION_EXTENDED, {
        auctionId,
        newEndTime: newEndTime.toISOString(),
        reason,
        timestamp: new Date().toISOString(),
      });

    this.logger.log(
      `Auction extended notification sent for auction ${auctionId}`,
    );
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

  getConnectionCount(): number {
    return this.server.sockets.sockets.size;
  }

  getRoomCount(): number {
    return this.auctionRooms.size;
  }

  getUserAuctionCount(userId: string): number {
    return this.userAuctions.get(userId)?.size || 0;
  }

  getUserAuctions(userId: string): string[] {
    const auctions = this.userAuctions.get(userId);
    return auctions ? Array.from(auctions) : [];
  }

  private extractDeviceInfo(client: Socket): {
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
  } {
    const userAgent =
      client.handshake.headers['user-agent'] ||
      client.handshake.headers['User-Agent'] ||
      undefined;
    const ipAddress =
      (client.handshake.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (client.handshake.headers['x-real-ip'] as string) ||
      client.handshake.address ||
      undefined;
    const deviceId =
      (client.handshake.query?.deviceId as string) ||
      (client.handshake.auth?.deviceId as string) ||
      undefined;

    let platform = 'unknown';
    if (userAgent) {
      if (userAgent.includes('Mobile')) {
        platform = 'mobile';
      } else if (userAgent.includes('Tablet')) {
        platform = 'tablet';
      } else {
        platform = 'desktop';
      }
    }

    return {
      deviceId,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
      ipAddress: typeof ipAddress === 'string' ? ipAddress : undefined,
      platform,
    };
  }

  getUserDevices(userId: string): Array<{
    socketId: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
    connectedAt: number;
    lastActivity: number;
  }> {
    const userSockets = this.userSockets.get(userId);
    if (!userSockets) {
      return [];
    }

    return Array.from(userSockets)
      .map((socketId) => {
        const metadata = this.socketMetadata.get(socketId);
        if (!metadata) {
          return null;
        }
        return {
          socketId,
          deviceId: metadata.deviceId,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          platform: metadata.platform,
          connectedAt: metadata.connectedAt,
          lastActivity: metadata.lastActivity,
        };
      })
      .filter(
        (device): device is NonNullable<typeof device> => device !== null,
      );
  }

  getSocketInfo(socketId: string): {
    userId?: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
    connectedAt?: number;
    lastActivity?: number;
  } | null {
    const metadata = this.socketMetadata.get(socketId);
    if (!metadata) {
      return null;
    }
    return {
      userId: metadata.userId,
      deviceId: metadata.deviceId,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      platform: metadata.platform,
      connectedAt: metadata.connectedAt,
      lastActivity: metadata.lastActivity,
    };
  }
}
