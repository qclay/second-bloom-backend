"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = exports.CACHE_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.CACHE_METADATA = 'cache:enabled';
const Cache = () => (0, common_1.SetMetadata)(exports.CACHE_METADATA, true);
exports.Cache = Cache;
//# sourceMappingURL=cache.decorator.js.map