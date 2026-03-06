import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user?: User | null; headers?: { authorization?: string } }>();
    const authHeader = request.headers?.authorization;
    if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
      request.user = null;
      return true;
    }
    return super.canActivate(context) as boolean;
  }

  handleRequest<TUser = User>(
    err: Error | null,
    user: TUser | false,
    _info: Error | null,
  ): TUser | null {
    if (err || !user) return null;
    return user;
  }
}
