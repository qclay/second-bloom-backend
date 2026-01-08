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
exports.ParticipantsResponseDto = exports.ParticipantResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ParticipantResponseDto {
    userId;
    firstName;
    lastName;
    phoneNumber;
    avatarUrl;
    bidCount;
    highestBid;
    totalBidAmount;
    lastBidAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String }, avatarUrl: { required: true, type: () => String, nullable: true }, bidCount: { required: true, type: () => Number }, highestBid: { required: true, type: () => Number }, totalBidAmount: { required: true, type: () => Number }, lastBidAt: { required: true, type: () => Date, nullable: true } };
    }
}
exports.ParticipantResponseDto = ParticipantResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1234567890abcdef' }),
    __metadata("design:type", String)
], ParticipantResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', nullable: true }),
    __metadata("design:type", Object)
], ParticipantResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', nullable: true }),
    __metadata("design:type", Object)
], ParticipantResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+998901234567' }),
    __metadata("design:type", String)
], ParticipantResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/avatar.jpg', nullable: true }),
    __metadata("design:type", Object)
], ParticipantResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Number of bids placed by this user',
    }),
    __metadata("design:type", Number)
], ParticipantResponseDto.prototype, "bidCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000, description: 'Highest bid amount' }),
    __metadata("design:type", Number)
], ParticipantResponseDto.prototype, "highestBid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150000, description: 'Total amount of all bids' }),
    __metadata("design:type", Number)
], ParticipantResponseDto.prototype, "totalBidAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-01T00:00:00Z', nullable: true }),
    __metadata("design:type", Object)
], ParticipantResponseDto.prototype, "lastBidAt", void 0);
class ParticipantsResponseDto {
    participants;
    totalParticipants;
    static _OPENAPI_METADATA_FACTORY() {
        return { participants: { required: true, type: () => [require("./participant-response.dto").ParticipantResponseDto] }, totalParticipants: { required: true, type: () => Number } };
    }
}
exports.ParticipantsResponseDto = ParticipantsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ParticipantResponseDto] }),
    __metadata("design:type", Array)
], ParticipantsResponseDto.prototype, "participants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Total number of participants' }),
    __metadata("design:type", Number)
], ParticipantsResponseDto.prototype, "totalParticipants", void 0);
//# sourceMappingURL=participant-response.dto.js.map