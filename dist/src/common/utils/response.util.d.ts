import { PaginationMetaDto } from '../dto/pagination-meta.dto';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';
export declare function createPaginationMeta(page: number, limit: number, total: number): PaginationMetaDto;
export declare function createSuccessResponse<T>(data: T, statusCode?: number, message?: string, path?: string, requestId?: string): ApiSuccessResponseDto<T>;
export declare function createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number, statusCode?: number, path?: string, requestId?: string): ApiSuccessResponseDto<T[]>;
