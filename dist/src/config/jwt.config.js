"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const config_1 = require("@nestjs/config");
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET ||
        'your-super-secret-refresh-token-key-change-in-production',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
}));
//# sourceMappingURL=jwt.config.js.map