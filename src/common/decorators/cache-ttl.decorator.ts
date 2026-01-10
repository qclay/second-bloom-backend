import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Decorator to specify cache TTL (Time To Live) in seconds
 * Can be used at controller or method level
 *
 * @example
 * ```typescript
 * @Controller('products')
 * @CacheTTL(1800) // 30 minutes for all methods
 * export class ProductController {
 *   @Get(':id')
 *   @CacheTTL(3600) // 1 hour for this specific method
 *   findOne(@Param('id') id: string) {
 *     return this.service.findById(id);
 *   }
 * }
 * ```
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
