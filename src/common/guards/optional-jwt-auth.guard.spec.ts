import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { ErrorCode } from '../constants/error-codes.constant';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;

  const createContext = (
    authorization?: string,
    user?: unknown,
  ): ExecutionContext => {
    const request: { headers: { authorization?: string }; user?: unknown } = {
      headers: {},
      user,
    };

    if (authorization !== undefined) {
      request.headers.authorization = authorization;
    }

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  it('allows anonymous request when authorization header is absent', () => {
    const context = createContext(undefined, { id: 'user-1' });
    const request = context.switchToHttp().getRequest<{
      user?: unknown;
      headers: { authorization?: string };
    }>();

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toBeNull();
  });

  it('delegates to passport auth for lowercase bearer scheme', () => {
    const context = createContext('bearer token-value');
    const parentPrototype = Object.getPrototypeOf(
      OptionalJwtAuthGuard.prototype,
    ) as {
      canActivate: (ctx: ExecutionContext) => boolean;
    };
    const canActivateSpy = jest
      .spyOn(parentPrototype, 'canActivate')
      .mockReturnValue(true);

    try {
      expect(guard.canActivate(context)).toBe(true);
      expect(canActivateSpy).toHaveBeenCalledWith(context);
    } finally {
      canActivateSpy.mockRestore();
    }
  });

  it('returns null user for non-bearer authorization in handleRequest', () => {
    const context = createContext('Basic abc123');

    const result = guard.handleRequest(null, false, null, context);

    expect(result).toBeNull();
  });

  it('returns authenticated user for valid bearer token in handleRequest', () => {
    const context = createContext('Bearer token-value');
    const user = { id: 'user-1' };

    const result = guard.handleRequest(null, user, null, context);

    expect(result).toEqual(user);
  });

  it('throws TOKEN_EXPIRED when bearer token is expired', () => {
    const context = createContext('Bearer expired-token');
    const info = new Error('jwt expired');
    info.name = 'TokenExpiredError';

    try {
      guard.handleRequest(null, false, info, context);
      fail('Expected UnauthorizedException to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect((error as { code?: ErrorCode }).code).toBe(
        ErrorCode.TOKEN_EXPIRED,
      );
    }
  });
});
