import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  connectedAt?: number;
  lastActivity?: number;
}

@Injectable()
export abstract class BaseGateway {
  protected readonly logger: Logger;
  protected readonly userSockets = new Map<string, Set<string>>();
  protected readonly socketMetadata = new Map<
    string,
    { userId: string; connectedAt: number; lastActivity: number }
  >();

  private readonly maxConnectionsPerUser: number;
  private readonly connectionTimeoutMs: number;
  private readonly inactivityTimeoutMs: number;
  private readonly cleanupIntervalMs: number;

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly gatewayName: string,
  ) {
    this.logger = new Logger(gatewayName);

    this.maxConnectionsPerUser =
      parseInt(
        this.configService.get<string>('WS_MAX_CONNECTIONS_PER_USER', '10'),
        10,
      ) || 10;
    this.connectionTimeoutMs =
      parseInt(
        this.configService.get<string>('WS_CONNECTION_TIMEOUT_MS', '300000'),
        10,
      ) || 300000;
    this.inactivityTimeoutMs =
      parseInt(
        this.configService.get<string>('WS_INACTIVITY_TIMEOUT_MS', '600000'),
        10,
      ) || 600000;
    this.cleanupIntervalMs =
      parseInt(
        this.configService.get<string>('WS_CLEANUP_INTERVAL_MS', '60000'),
        10,
      ) || 60000;
  }

  protected async authenticateSocket(
    client: AuthenticatedSocket,
  ): Promise<boolean> {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        return false;
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

      const userConnections = this.userSockets.get(userId);
      if (
        userConnections &&
        userConnections.size >= this.maxConnectionsPerUser
      ) {
        this.logger.warn(
          `User ${userId} exceeded max connections (${this.maxConnectionsPerUser}). Disconnecting oldest.`,
        );
        const oldestSocketId = Array.from(userConnections)[0];
        this.removeUserSocket(userId, oldestSocketId);
      }

      client.userId = userId;
      const now = Date.now();
      client.connectedAt = now;
      client.lastActivity = now;

      this.addUserSocket(userId, client.id);
      this.socketMetadata.set(client.id, {
        userId,
        connectedAt: now,
        lastActivity: now,
      });

      return true;
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  protected updateActivity(socketId: string): void {
    const metadata = this.socketMetadata.get(socketId);
    if (metadata) {
      metadata.lastActivity = Date.now();
    }
  }

  protected extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = client.handshake.auth?.token;
    if (token && typeof token === 'string') {
      return token;
    }

    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }

  protected addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socketId);
  }

  protected removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketMetadata.delete(socketId);
  }

  protected sendToUser(
    server: Server,
    userId: string,
    event: string,
    data: unknown,
  ): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        server.to(socketId).emit(event, data);
      });
    }
  }

  protected cleanupInactiveConnections(server?: Server): void {
    const now = Date.now();
    let cleaned = 0;
    const socketsToDisconnect: string[] = [];

    for (const [socketId, metadata] of this.socketMetadata.entries()) {
      const inactiveTime = now - metadata.lastActivity;
      const connectionAge = now - metadata.connectedAt;

      if (
        inactiveTime > this.inactivityTimeoutMs ||
        connectionAge > this.connectionTimeoutMs
      ) {
        socketsToDisconnect.push(socketId);
        this.removeUserSocket(metadata.userId, socketId);
        cleaned++;
      }
    }

    if (server && socketsToDisconnect.length > 0) {
      socketsToDisconnect.forEach((socketId) => {
        const socket = server.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      });
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} inactive connections`);
    }
  }

  getConnectionCount(server: Server): number {
    return server.sockets.sockets.size;
  }

  getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  getUniqueUserCount(): number {
    return this.userSockets.size;
  }

  getConnectionStats(): {
    totalConnections: number;
    uniqueUsers: number;
    averageConnectionsPerUser: number;
  } {
    const uniqueUsers = this.userSockets.size;
    const totalConnections = Array.from(this.userSockets.values()).reduce(
      (sum, sockets) => sum + sockets.size,
      0,
    );

    return {
      totalConnections,
      uniqueUsers,
      averageConnectionsPerUser:
        uniqueUsers > 0 ? totalConnections / uniqueUsers : 0,
    };
  }
}
