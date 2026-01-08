import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const headerValue = request.headers['x-request-id'];
    const requestId =
      typeof headerValue === 'string'
        ? headerValue
        : Array.isArray(headerValue)
          ? headerValue[0]
          : uuidv4();

    request.id = requestId;
    response.setHeader('X-Request-ID', requestId);

    return next.handle();
  }
}
