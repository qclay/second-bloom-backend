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
exports.UpdateAuctionDto = void 0;
const openapi = require("@nestjs/swagger");
const mapped_types_1 = require("@nestjs/mapped-types");
const create_auction_dto_1 = require("./create-auction.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class UpdateAuctionDto extends (0, mapped_types_1.PartialType)(create_auction_dto_1.CreateAuctionDto) {
    startPrice;
    bidIncrement;
    minBidAmount;
    endTime;
    durationHours;
    autoExtend;
    extendMinutes;
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { startPrice: { required: false, type: () => Number, minimum: 0 }, bidIncrement: { required: false, type: () => Number, minimum: 0 }, minBidAmount: { required: false, type: () => Number, minimum: 0 }, endTime: { required: false, type: () => String }, durationHours: { required: false, type: () => Number, minimum: 1, maximum: 168 }, autoExtend: { required: false, type: () => Boolean }, extendMinutes: { required: false, type: () => Number, minimum: 1, maximum: 60 }, status: { required: false, type: () => Object } };
    }
}
exports.UpdateAuctionDto = UpdateAuctionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuctionDto.prototype, "startPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuctionDto.prototype, "bidIncrement", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuctionDto.prototype, "minBidAmount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuctionDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(168),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuctionDto.prototype, "durationHours", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAuctionDto.prototype, "autoExtend", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuctionDto.prototype, "extendMinutes", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AuctionStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuctionDto.prototype, "status", void 0);
//# sourceMappingURL=update-auction.dto.js.map