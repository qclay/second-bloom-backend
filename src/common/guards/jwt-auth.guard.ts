import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ErrorCode } from '../constants/error-codes.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = User>(
    err: Error | null,
    user: TUser | false,
    info: Error | null,
  ): TUser {
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
