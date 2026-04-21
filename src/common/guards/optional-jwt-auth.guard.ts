import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ErrorCode } from '../constants/error-codes.constant';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  private hasBearerToken(authHeader?: string): boolean {
    if (!authHeader) {
      return false;
    }

    return /^\s*bearer\s+\S+\s*$/i.test(authHeader);
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      user?: User | null;
      headers?: { authorization?: string };
    }>();
    const authHeader = request.headers?.authorization;
    if (!this.hasBearerToken(authHeader)) {
      request.user = null;
      return true;
    }
    return super.canActivate(context) as boolean;
  }

  handleRequest<TUser = User>(
    err: Error | null,
    user: TUser | false,
    info: Error | null,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
    }>();
    const hasBearer = this.hasBearerToken(request.headers?.authorization);

    if (!hasBearer) {
      return null as TUser;
    }

    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        const error = new UnauthorizedException('Access token has expired');
        (error as unknown as { code: ErrorCode }).code =
          ErrorCode.TOKEN_EXPIRED;
        throw error;
      }

      if (info?.name === 'JsonWebTokenError') {
        const error = new UnauthorizedException('Invalid access token');
        (error as unknown as { code: ErrorCode }).code =
          ErrorCode.INVALID_TOKEN;
        throw error;
      }

      if (err) {
        throw err;
      }

      const error = new UnauthorizedException('Authentication required');
      (error as unknown as { code: ErrorCode }).code = ErrorCode.UNAUTHORIZED;
      throw error;
    }

    return user;
  }
}
