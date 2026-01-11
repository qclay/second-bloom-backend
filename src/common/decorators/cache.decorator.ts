import { SetMetadata } from '@nestjs/common';

export const CACHE_METADATA = 'cache:enabled';

export const Cache = () => SetMetadata(CACHE_METADATA, true);
