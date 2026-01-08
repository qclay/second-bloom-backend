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
exports.SellerStatisticsDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class SellerStatisticsDto {
    totalProducts;
    activeProducts;
    inactiveProducts;
    totalViews;
    totalOrders;
    pendingOrders;
    activeAuctions;
    completedAuctions;
    static _OPENAPI_METADATA_FACTORY() {
        return { totalProducts: { required: true, type: () => Number }, activeProducts: { required: true, type: () => Number }, inactiveProducts: { required: true, type: () => Number }, totalViews: { required: true, type: () => Number }, totalOrders: { required: true, type: () => Number }, pendingOrders: { required: true, type: () => Number }, activeAuctions: { required: true, type: () => Number }, completedAuctions: { required: true, type: () => Number } };
    }
}
exports.SellerStatisticsDto = SellerStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250, description: 'Total number of products' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "totalProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150, description: 'Number of active products' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "activeProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Number of inactive products' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "inactiveProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1500,
        description: 'Total views across all products',
    }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "totalViews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'Total number of orders' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "totalOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Number of pending orders' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "pendingOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Number of active auctions' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "activeAuctions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Number of completed auctions' }),
    __metadata("design:type", Number)
], SellerStatisticsDto.prototype, "completedAuctions", void 0);
//# sourceMappingURL=seller-statistics.dto.js.map