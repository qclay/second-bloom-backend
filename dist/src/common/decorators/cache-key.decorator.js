"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKey = exports.CACHE_KEY_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CACHE_KEY_METADATA = 'cache:key';
const CacheKey = (key) => (0, common_1.SetMetadata)(exports.CACHE_KEY_METADATA, key);
exports.CacheKey = CacheKey;
//# sourceMappingURL=cache-key.decorator.js.map