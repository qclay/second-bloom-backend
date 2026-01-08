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
exports.AuctionResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const product_nested_dto_1 = require("../../product/dto/product-nested.dto");
class AuctionResponseDto {
    id;
    productId;
    creatorId;
    startPrice;
    currentPrice;
    bidIncrement;
    minBidAmount;
    startTime;
    endTime;
    durationHours;
    status;
    winnerId;
    autoExtend;
    extendMinutes;
    views;
    totalBids;
    version;
    lastBidAt;
    createdAt;
    updatedAt;
    deletedAt;
    product;
    creator;
    winner;
    static fromEntity(auction) {
        return {
            id: auction.id,
            productId: auction.productId,
            creatorId: auction.creatorId,
            startPrice: Number(auction.startPrice),
            currentPrice: Number(auction.currentPrice),
            bidIncrement: Number(auction.bidIncrement),
            minBidAmount: Number(auction.minBidAmount),
            startTime: auction.startTime,
            endTime: auction.endTime,
            durationHours: auction.durationHours,
            status: auction.status,
            winnerId: auction.winnerId,
            autoExtend: auction.autoExtend,
            extendMinutes: auction.extendMinutes,
            views: auction.views,
            totalBids: auction.totalBids,
            version: auction.version,
            lastBidAt: auction.lastBidAt,
            createdAt: auction.createdAt,
            updatedAt: auction.updatedAt,
            deletedAt: auction.deletedAt,
            product: auction.product
                ? {
                    id: auction.product.id,
                    title: auction.product.title,
                    slug: auction.product.slug,
                    price: typeof auction.product.price === 'number'
                        ? auction.product.price
                        : Number(auction.product.price) || 0,
                    images: auction.product.images?.map((img) => ({
                        url: img.file?.url,
                    })),
                }
                : undefined,
            creator: auction.creator
                ? {
                    id: auction.creator.id,
                    firstName: auction.creator.firstName,
                    lastName: auction.creator.lastName,
                    phoneNumber: auction.creator.phoneNumber,
                }
                : undefined,
            winner: auction.winner
                ? {
                    id: auction.winner.id,
                    firstName: auction.winner.firstName,
                    lastName: auction.winner.lastName,
                    phoneNumber: auction.winner.phoneNumber,
                }
                : null,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, productId: { required: true, type: () => String }, creatorId: { required: true, type: () => String }, startPrice: { required: true, type: () => Number }, currentPrice: { required: true, type: () => Number }, bidIncrement: { required: true, type: () => Number }, minBidAmount: { required: true, type: () => Number }, startTime: { required: true, type: () => Date }, endTime: { required: true, type: () => Date }, durationHours: { required: true, type: () => Number }, status: { required: true, type: () => String }, winnerId: { required: true, type: () => String, nullable: true }, autoExtend: { required: true, type: () => Boolean }, extendMinutes: { required: true, type: () => Number }, views: { required: true, type: () => Number }, totalBids: { required: true, type: () => Number }, version: { required: true, type: () => Number }, lastBidAt: { required: true, type: () => Date, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date, nullable: true }, product: { required: false, type: () => require("../../product/dto/product-nested.dto").ProductNestedDto }, creator: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }) }, winner: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }), nullable: true } };
    }
}
exports.AuctionResponseDto = AuctionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuctionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuctionResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuctionResponseDto.prototype, "creatorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "startPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "currentPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "bidIncrement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "minBidAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AuctionResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AuctionResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "durationHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuctionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], AuctionResponseDto.prototype, "winnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AuctionResponseDto.prototype, "autoExtend", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "extendMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "views", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "totalBids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuctionResponseDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], AuctionResponseDto.prototype, "lastBidAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AuctionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AuctionResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], AuctionResponseDto.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => product_nested_dto_1.ProductNestedDto, required: false }),
    __metadata("design:type", product_nested_dto_1.ProductNestedDto)
], AuctionResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], AuctionResponseDto.prototype, "creator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    __metadata("design:type", Object)
], AuctionResponseDto.prototype, "winner", void 0);
//# sourceMappingURL=auction-response.dto.js.map