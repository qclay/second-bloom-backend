"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const sms_module_1 = require("./sms/sms.module");
const aws_module_1 = require("./aws/aws.module");
const firebase_module_1 = require("./firebase/firebase.module");
const telegram_module_1 = require("./telegram/telegram.module");
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [sms_module_1.SmsModule, aws_module_1.AwsModule, firebase_module_1.FirebaseModule, telegram_module_1.TelegramModule],
        exports: [sms_module_1.SmsModule, aws_module_1.AwsModule, firebase_module_1.FirebaseModule, telegram_module_1.TelegramModule],
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map