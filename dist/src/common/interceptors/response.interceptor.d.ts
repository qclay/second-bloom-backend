import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponseDto<T>> {
    private readonly configService;
    constructor(configService: ConfigService);
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponseDto<T>>;
}
