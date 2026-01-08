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
exports.SellerDashboardDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const seller_statistics_dto_1 = require("./seller-statistics.dto");
const seller_income_dto_1 = require("./seller-income.dto");
const seller_activity_dto_1 = require("./seller-activity.dto");
class SellerDashboardDto {
    statistics;
    income;
    recentActivities;
    static _OPENAPI_METADATA_FACTORY() {
        return { statistics: { required: true, type: () => require("./seller-statistics.dto").SellerStatisticsDto }, income: { required: true, type: () => require("./seller-income.dto").SellerIncomeDto }, recentActivities: { required: true, type: () => require("./seller-activity.dto").SellerActivityDto } };
    }
}
exports.SellerDashboardDto = SellerDashboardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: seller_statistics_dto_1.SellerStatisticsDto, description: 'Seller statistics' }),
    __metadata("design:type", seller_statistics_dto_1.SellerStatisticsDto)
], SellerDashboardDto.prototype, "statistics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: seller_income_dto_1.SellerIncomeDto,
        description: 'Seller income information',
    }),
    __metadata("design:type", seller_income_dto_1.SellerIncomeDto)
], SellerDashboardDto.prototype, "income", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: seller_activity_dto_1.SellerActivityDto,
        description: 'Recent orders and auctions',
    }),
    __metadata("design:type", seller_activity_dto_1.SellerActivityDto)
], SellerDashboardDto.prototype, "recentActivities", void 0);
//# sourceMappingURL=seller-dashboard.dto.js.map