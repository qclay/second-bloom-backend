"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class UserResponseDto {
    id;
    phoneNumber;
    firstName;
    lastName;
    email;
    avatarId;
    isVerified;
    isActive;
    role;
    rating;
    totalRatings;
    region;
    city;
    district;
    lastLoginAt;
    createdAt;
    updatedAt;
    static fromEntity(user) {
        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarId: user.avatarId,
            isVerified: user.isVerified,
            isActive: user.isActive,
            role: user.role,
            rating: Number(user.rating),
            totalRatings: user.totalRatings,
            region: user.region,
            city: user.city,
            district: user.district,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, email: { required: true, type: () => String, nullable: true }, avatarId: { required: true, type: () => String, nullable: true }, isVerified: { required: true, type: () => Boolean }, isActive: { required: true, type: () => Boolean }, role: { required: true, type: () => String }, rating: { required: true, type: () => Number }, totalRatings: { required: true, type: () => Number }, region: { required: true, type: () => String, nullable: true }, city: { required: true, type: () => String, nullable: true }, district: { required: true, type: () => String, nullable: true }, lastLoginAt: { required: true, type: () => Date, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.UserResponseDto = UserResponseDto;
//# sourceMappingURL=user-response.dto.js.map