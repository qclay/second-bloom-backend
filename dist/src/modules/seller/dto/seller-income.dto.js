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
exports.SellerIncomeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class SellerIncomeDto {
    totalIncome;
    currency;
    pendingIncome;
    completedIncome;
    thisMonth;
    lastMonth;
    refundedAmount;
    static _OPENAPI_METADATA_FACTORY() {
        return { totalIncome: { required: true, type: () => Number }, currency: { required: true, type: () => String }, pendingIncome: { required: true, type: () => Number }, completedIncome: { required: true, type: () => Number }, thisMonth: { required: true, type: () => Number }, lastMonth: { required: true, type: () => Number }, refundedAmount: { required: true, type: () => Number } };
    }
}
exports.SellerIncomeDto = SellerIncomeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000000, description: 'Total income in UZS' }),
    __metadata("design:type", Number)
], SellerIncomeDto.prototype, "totalIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UZS', description: 'Currency code' }),
    __metadata("design:type", String)
], SellerIncomeDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2000000,
        description: 'Pending income (not yet paid)',
    }),
    __metadata("design:type", Number)
], SellerIncomeDto.prototype, "pendingIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 13000000, description: 'Completed income (paid)' }),
    __metadata("design:type", Number)
], SellerIncomeDto.prototype, "completedIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000000, description: 'Income for current month' }),
    __metadata("design:type", Number)
], SellerIncomeDto.prototype, "thisMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4500000, description: 'Income for last month' }),
    __metadata("design:type", Number)
], SellerIncomeDto.prototype, "lastMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Refunded amount (deprecated)' }),
    __metadata("design:type", Number)
], SellerIncomeDto.prototype, "refundedAmount", void 0);
//# sourceMappingURL=seller-income.dto.js.map