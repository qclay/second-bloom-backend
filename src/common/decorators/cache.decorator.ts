import { SetMetadata } from '@nestjs/common';

export const CACHE_METADATA = 'cache:enabled';

/**
 * Decorator to enable caching for a method
 * Works with @CacheKey and @CacheTTL
 *
 * @example
 * ```typescript
 * @Get()
 * @Cache()
 * @CacheKey('products:list')
 * @CacheTTL(300)
 * findAll() {
 *   return this.service.findAll();
 * }
 * ```
 */
export const Cache = () => SetMetadata(CACHE_METADATA, true);
