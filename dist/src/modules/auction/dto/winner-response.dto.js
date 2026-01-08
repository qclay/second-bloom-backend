"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinnersResponseDto = exports.WinnerResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class WinnerResponseDto {
    rank;
    userId;
    firstName;
    lastName;
    phoneNumber;
    avatarUrl;
    highestBid;
    bidCount;
    static _OPENAPI_METADATA_FACTORY() {
        return { rank: { required: true, type: () => Number }, userId: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String }, avatarUrl: { required: true, type: () => String, nullable: true }, highestBid: { required: true, type: () => Number }, bidCount: { required: true, type: () => Number } };
    }
}
exports.WinnerResponseDto = WinnerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Rank position (1st, 2nd, 3rd)' }),
    __metadata("design:type", Number)
], WinnerResponseDto.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], WinnerResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', nullable: true }),
    __metadata("design:type", Object)
], WinnerResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', nullable: true }),
    __metadata("design:type", Object)
], WinnerResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+998901234567' }),
    __metadata("design:type", String)
], WinnerResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/avatar.jpg', nullable: true }),
    __metadata("design:type", Object)
], WinnerResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000, description: 'Highest bid amount' }),
    __metadata("design:type", Number)
], WinnerResponseDto.prototype, "highestBid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Number of bids placed' }),
    __metadata("design:type", Number)
], WinnerResponseDto.prototype, "bidCount", void 0);
class WinnersResponseDto {
    winners;
    static _OPENAPI_METADATA_FACTORY() {
        return { winners: { required: true, type: () => [require("./winner-response.dto").WinnerResponseDto] } };
    }
}
exports.WinnersResponseDto = WinnersResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [WinnerResponseDto] }),
    __metadata("design:type", Array)
], WinnersResponseDto.prototype, "winners", void 0);
//# sourceMappingURL=winner-response.dto.js.map