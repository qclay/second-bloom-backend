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
exports.CreateAuctionDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateAuctionDto {
    productId;
    startPrice;
    bidIncrement = 1000;
    minBidAmount;
    endTime;
    durationHours = 2;
    autoExtend = true;
    extendMinutes = 5;
    static _OPENAPI_METADATA_FACTORY() {
        return { productId: { required: true, type: () => String }, startPrice: { required: true, type: () => Number, minimum: 0.01 }, bidIncrement: { required: false, type: () => Number, default: 1000, minimum: 0 }, minBidAmount: { required: false, type: () => Number, minimum: 0 }, endTime: { required: false, type: () => String }, durationHours: { required: false, type: () => Number, default: 2, minimum: 1, maximum: 168 }, autoExtend: { required: false, type: () => Boolean, default: true }, extendMinutes: { required: false, type: () => Number, default: 5, minimum: 1, maximum: 60 } };
    }
}
exports.CreateAuctionDto = CreateAuctionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product ID to create auction for',
        example: 'clx1234567890abcdef',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Starting price for the auction',
        example: 100000,
        minimum: 0.01,
        required: true,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "startPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum bid increment amount',
        example: 1000,
        minimum: 0,
        default: 1000,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "bidIncrement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum bid amount',
        example: 5000,
        minimum: 0,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "minBidAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Auction end time (ISO 8601 format)',
        example: '2024-12-31T23:59:59Z',
        required: false,
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuctionDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Auction duration in hours (1-168)',
        example: 24,
        minimum: 1,
        maximum: 168,
        default: 2,
        required: false,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(168),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "durationHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Auto-extend auction if bid placed near end time',
        example: true,
        default: true,
        required: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAuctionDto.prototype, "autoExtend", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minutes before end time to trigger auto-extend',
        example: 5,
        minimum: 1,
        maximum: 60,
        default: 5,
        required: false,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuctionDto.prototype, "extendMinutes", void 0);
//# sourceMappingURL=create-auction.dto.js.map