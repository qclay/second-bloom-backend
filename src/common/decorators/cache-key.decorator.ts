import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';

/**
 * Decorator to specify a custom cache key for a method
 *
 * @example
 * ```typescript
 * @Get()
 * @CacheKey('products:list')
 * findAll() {
 *   return this.service.findAll();
 * }
 * ```
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
