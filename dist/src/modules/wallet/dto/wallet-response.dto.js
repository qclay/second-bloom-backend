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
exports.WalletResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class WalletResponseDto {
    balance;
    publicationCredits;
    currency;
    static _OPENAPI_METADATA_FACTORY() {
        return { balance: { required: true, type: () => Number }, publicationCredits: { required: true, type: () => Number }, currency: { required: true, type: () => String } };
    }
}
exports.WalletResponseDto = WalletResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50000,
        description: 'Current balance in UZS',
    }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Number of available publication credits',
    }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "publicationCredits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'UZS',
        description: 'Currency',
    }),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "currency", void 0);
//# sourceMappingURL=wallet-response.dto.js.map