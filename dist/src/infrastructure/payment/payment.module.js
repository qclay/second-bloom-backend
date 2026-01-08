"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentInfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const payment_service_1 = require("./payment.service");
const payme_strategy_1 = require("./strategies/payme.strategy");
const click_strategy_1 = require("./strategies/click.strategy");
let PaymentInfrastructureModule = class PaymentInfrastructureModule {
};
exports.PaymentInfrastructureModule = PaymentInfrastructureModule;
exports.PaymentInfrastructureModule = PaymentInfrastructureModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        providers: [payment_service_1.PaymentService, payme_strategy_1.PaymeStrategy, click_strategy_1.ClickStrategy],
        exports: [payment_service_1.PaymentService],
    })
], PaymentInfrastructureModule);
//# sourceMappingURL=payment.module.js.map