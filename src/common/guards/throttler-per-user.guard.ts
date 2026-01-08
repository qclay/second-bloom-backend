import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerOptions,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { Request, Response } from 'express';

@Injectable()
export class ThrottlerPerUserGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request & { user?: { id: string } };
    const userId = request.user?.id;
    const ip = request.ip || request.socket?.remoteAddress || 'anonymous';
    return Promise.resolve(userId || ip);
  }

  protected getLimit(
    context: ExecutionContext,
    throttler: ThrottlerOptions,
  ): number {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id: string; role?: string } }>();
    const user = request.user;
    const baseLimit =
      typeof throttler.limit === 'number' ? throttler.limit : 100;

    if (user?.role === 'ADMIN') {
      return baseLimit * 10;
    }

    if (user?.id) {
      return baseLimit * 2;
    }

    return baseLimit;
  }

  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();

    const limit = throttlerLimitDetail.limit;
    const remaining = Math.max(0, limit - throttlerLimitDetail.totalHits);
    const reset = Math.ceil(
      (Date.now() + throttlerLimitDetail.timeToExpire) / 1000,
    );
    const retryAfter = Math.ceil(throttlerLimitDetail.timeToExpire / 1000);

    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader('X-RateLimit-Reset', reset.toString());
    response.setHeader('Retry-After', retryAfter.toString());

    throw new HttpException(
      {
        success: false,
        message: `Too many requests. Limit: ${limit} requests per ${throttlerLimitDetail.ttl}ms. Please try again in ${retryAfter}s.`,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        limit,
        remaining,
        reset,
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  protected addThrottlerHeaders(
    response: Response,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): void {
    const limit = throttlerLimitDetail.limit;
    const remaining = Math.max(0, limit - throttlerLimitDetail.totalHits);
    const reset = Math.ceil(
      (Date.now() + throttlerLimitDetail.timeToExpire) / 1000,
    );

    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader('X-RateLimit-Reset', reset.toString());
  }
}
