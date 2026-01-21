import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';

@Injectable()
export class WsValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WsValidationInterceptor.name);

  constructor(private readonly dtoClass: new () => object) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const dto = plainToInstance(this.dtoClass, data, {
      enableImplicitConversion: true,
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}))
        .flat();

      this.logger.warn(
        `Validation failed for socket ${client.id}: ${errorMessages.join(', ')}`,
      );

      throw new WsException({
        error: 'Validation failed',
        details: errorMessages,
      });
    }

    return next.handle();
  }
}

export function createWsValidationInterceptor(
  dtoClass: new () => object,
): WsValidationInterceptor {
  return new WsValidationInterceptor(dtoClass);
}
