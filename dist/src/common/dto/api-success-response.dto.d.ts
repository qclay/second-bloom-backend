import { PaginationMetaDto } from './pagination-meta.dto';
export declare class ApiSuccessResponseDto<T = unknown> {
    success: boolean;
    statusCode: number;
    message?: string;
    data: T | null;
    timestamp: string;
    path?: string;
    requestId?: string;
    meta?: {
        pagination?: PaginationMetaDto;
        [key: string]: unknown;
    };
}
