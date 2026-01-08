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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const payme_strategy_1 = require("./strategies/payme.strategy");
const click_strategy_1 = require("./strategies/click.strategy");
let PaymentService = PaymentService_1 = class PaymentService {
    paymeStrategy;
    clickStrategy;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(paymeStrategy, clickStrategy) {
        this.paymeStrategy = paymeStrategy;
        this.clickStrategy = clickStrategy;
    }
    getStrategy(gateway) {
        switch (gateway) {
            case client_1.PaymentGateway.PAYME:
                return this.paymeStrategy;
            case client_1.PaymentGateway.CLICK:
                return this.clickStrategy;
            default:
                throw new Error(`Unsupported payment gateway: ${String(gateway)}`);
        }
    }
    async initiatePayment(amount, orderId, gateway, transactionId) {
        const strategy = this.getStrategy(gateway);
        const result = await strategy.initiatePayment(amount, orderId, transactionId);
        return {
            ...result,
            transactionId,
        };
    }
    async verifyPayment(transactionId, gateway, gatewayTransactionId) {
        const strategy = this.getStrategy(gateway);
        const result = await strategy.verifyPayment(gatewayTransactionId, transactionId);
        return result.success && result.status === 'COMPLETED';
    }
    async refundPayment(transactionId, amount, gateway, gatewayTransactionId) {
        const strategy = this.getStrategy(gateway);
        const result = await strategy.refundPayment(gatewayTransactionId, amount, transactionId);
        return result.success;
    }
    verifyWebhook(gateway, payload, headers) {
        const strategy = this.getStrategy(gateway);
        return strategy.verifyWebhook(payload, headers);
    }
    async processWebhook(gateway, payload) {
        const strategy = this.getStrategy(gateway);
        return strategy.processWebhook(payload);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payme_strategy_1.PaymeStrategy,
        click_strategy_1.ClickStrategy])
], PaymentService);
//# sourceMappingURL=payment.service.js.map