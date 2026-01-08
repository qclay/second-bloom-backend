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
exports.CreatePaymentDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreatePaymentDto {
    orderId;
    method;
    gateway;
    amount;
    static _OPENAPI_METADATA_FACTORY() {
        return { orderId: { required: true, type: () => String }, method: { required: true, type: () => Object }, gateway: { required: false, type: () => Object }, amount: { required: false, type: () => Number, minimum: 0.01 } };
    }
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Order ID to create payment for',
        example: 'clx1234567890abcdef',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method',
        enum: client_1.PaymentMethod,
        example: client_1.PaymentMethod.CARD,
        required: true,
    }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment gateway',
        enum: client_1.PaymentGateway,
        example: client_1.PaymentGateway.PAYME,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(client_1.PaymentGateway),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "gateway", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment amount (optional, defaults to order amount)',
        example: 150000,
        minimum: 0.01,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
//# sourceMappingURL=create-payment.dto.js.map