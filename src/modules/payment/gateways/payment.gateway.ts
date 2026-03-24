import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_EVENTS } from '../constants/payment-events.constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export interface PaymentSuccessPayload {
  paymentId: string;
  amount: number;
  paymentType: string;
  quantity?: number;
  balanceAdded?: number;
  creditsAdded?: number;
  timestamp: string;
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
  namespace: '/payment',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
})
export class PaymentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PaymentGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
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

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtSecret,
      });

      const userId = payload.sub;
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID in token');
      }

      await this.ensureActiveSession(userId, payload.tokenVersion);

      client.userId = userId;
      this.addUserSocket(userId, client.id);

      this.logger.log(
        `Payment client ${client.id} connected as user ${userId}`,
      );

      client.emit(PAYMENT_EVENTS.CONNECTED, {
        userId,
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

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      this.removeUserSocket(client.userId, client.id);
      this.logger.log(
        `Payment client ${client.id} disconnected (user ${client.userId})`,
      );
    }
  }

  notifyPaymentSuccess(userId: string, payload: PaymentSuccessPayload): void {
    this.sendToUser(userId, PAYMENT_EVENTS.PAYMENT_SUCCESS, payload);
    this.logger.log(
      `Payment success notification sent to user ${userId}, payment ${payload.paymentId}`,
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
    if (token) return token;
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') return queryToken;
    return null;
  }

  private async ensureActiveSession(
    userId: string,
    tokenVersion: number,
  ): Promise<void> {
    if (typeof tokenVersion !== 'number') {
      throw new Error('Missing token version in token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isActive: true,
        refreshTokenVersion: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    if (user.refreshTokenVersion !== tokenVersion) {
      throw new Error('Token has been revoked');
    }
  }
}
