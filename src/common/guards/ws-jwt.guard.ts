import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = this.extractTokenFromSocket(client);

    if (!token) {
      this.logger.warn(
        `Client ${client.id} attempted connection without token`,
      );
      throw new WsException('Unauthorized: No token provided');
    }

    try {
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

      if (typeof payload.tokenVersion !== 'number') {
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

      if (user.refreshTokenVersion !== payload.tokenVersion) {
        throw new Error('Token has been revoked');
      }

      client.userId = userId;
      return true;
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new WsException('Unauthorized: Invalid token');
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
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
}
