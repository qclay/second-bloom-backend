import { Type } from '@nestjs/common';
export declare function ApiSuccessResponse(status?: number, description?: string, dataType?: Type<unknown>, isPaginated?: boolean): MethodDecorator & ClassDecorator;
export declare function ApiPaginatedResponse(dataType: Type<unknown>, description?: string, status?: number): MethodDecorator & ClassDecorator;
