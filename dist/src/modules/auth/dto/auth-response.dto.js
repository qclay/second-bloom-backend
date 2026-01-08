"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class AuthResponseDto {
    user;
    accessToken;
    refreshToken;
    static fromUser(user, accessToken, refreshToken) {
        return {
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
            accessToken,
            refreshToken,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { user: { required: true, type: () => ({ id: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, email: { required: true, type: () => String, nullable: true }, role: { required: true, type: () => String }, isActive: { required: true, type: () => Boolean } }) }, accessToken: { required: true, type: () => String }, refreshToken: { required: true, type: () => String } };
    }
}
exports.AuthResponseDto = AuthResponseDto;
//# sourceMappingURL=auth-response.dto.js.map