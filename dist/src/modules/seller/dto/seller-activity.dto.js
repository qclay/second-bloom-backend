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
exports.SellerActivityDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const order_response_dto_1 = require("../../order/dto/order-response.dto");
const auction_response_dto_1 = require("../../auction/dto/auction-response.dto");
class SellerActivityDto {
    orders;
    auctions;
    total;
    static _OPENAPI_METADATA_FACTORY() {
        return { orders: { required: true, type: () => [require("../../order/dto/order-response.dto").OrderResponseDto] }, auctions: { required: true, type: () => [require("../../auction/dto/auction-response.dto").AuctionResponseDto] }, total: { required: true, type: () => Number } };
    }
}
exports.SellerActivityDto = SellerActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [order_response_dto_1.OrderResponseDto], description: 'List of orders' }),
    __metadata("design:type", Array)
], SellerActivityDto.prototype, "orders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [auction_response_dto_1.AuctionResponseDto], description: 'List of auctions' }),
    __metadata("design:type", Array)
], SellerActivityDto.prototype, "auctions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25, description: 'Total count of activities' }),
    __metadata("design:type", Number)
], SellerActivityDto.prototype, "total", void 0);
//# sourceMappingURL=seller-activity.dto.js.map