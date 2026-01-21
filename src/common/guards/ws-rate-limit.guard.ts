import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class WsRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(WsRateLimitGuard.name);
  private readonly rateLimitMap = new Map<string, RateLimitEntry>();

  private readonly maxMessages = 100;
  private readonly windowMs = 60000;
  private readonly cleanupInterval = 300000;

  constructor() {
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const socketId = client.id;

    const now = Date.now();
    const entry = this.rateLimitMap.get(socketId);

    if (!entry || now > entry.resetAt) {
      this.rateLimitMap.set(socketId, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxMessages) {
      this.logger.warn(
        `Rate limit exceeded for socket ${socketId}. Count: ${entry.count}/${this.maxMessages}`,
      );
      throw new WsException(
        `Rate limit exceeded. Maximum ${this.maxMessages} messages per ${this.windowMs / 1000} seconds.`,
      );
    }

    entry.count++;
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [socketId, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        this.rateLimitMap.delete(socketId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  removeSocket(socketId: string): void {
    this.rateLimitMap.delete(socketId);
  }
}
