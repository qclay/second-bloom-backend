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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const swagger_1 = require("@nestjs/swagger");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async paymeWebhook(req, headers) {
        await this.paymentService.handleWebhook(client_1.PaymentGateway.PAYME, req.body, headers);
        return { ok: true };
    }
    async clickWebhook(req, headers) {
        await this.paymentService.handleWebhook(client_1.PaymentGateway.CLICK, req.body, headers);
        return { ok: true };
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('webhooks/payme'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Payme payment webhook',
        description: 'Webhook endpoint for Payme payment gateway callbacks. Processes payment status updates from Payme.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                ok: {
                    type: 'boolean',
                    example: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid webhook data or signature',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "paymeWebhook", null);
__decorate([
    (0, common_1.Post)('webhooks/click'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Click payment webhook',
        description: 'Webhook endpoint for Click payment gateway callbacks. Processes payment status updates from Click.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                ok: {
                    type: 'boolean',
                    example: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid webhook data or signature',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "clickWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map