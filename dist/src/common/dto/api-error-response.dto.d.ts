import { ApiErrorDetailDto } from './api-error-detail.dto';
export declare class ApiErrorObjectDto {
    code: string;
    message: string;
    details?: ApiErrorDetailDto[];
    documentation?: string;
}
export declare class ApiErrorResponseDto {
    success: boolean;
    error: ApiErrorObjectDto;
    statusCode: number;
    timestamp: string;
    path: string;
    requestId?: string;
}
