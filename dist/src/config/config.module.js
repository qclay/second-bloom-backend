"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_config_1 = require("./database.config");
const jwt_config_1 = require("./jwt.config");
const redis_config_1 = require("./redis.config");
const aws_config_1 = require("./aws.config");
const sms_config_1 = require("./sms.config");
const payment_config_1 = require("./payment.config");
const sentry_config_1 = require("./sentry.config");
const firebase_config_1 = require("./firebase.config");
const telegram_config_1 = __importDefault(require("./telegram.config"));
const env_validation_1 = require("./env.validation");
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    database_config_1.databaseConfig,
                    jwt_config_1.jwtConfig,
                    redis_config_1.redisConfig,
                    aws_config_1.awsConfig,
                    sms_config_1.smsConfig,
                    payment_config_1.paymentConfig,
                    sentry_config_1.sentryConfig,
                    firebase_config_1.firebaseConfig,
                    telegram_config_1.default,
                ],
                validate: env_validation_1.validateEnv,
                envFilePath: ['.env.local', '.env'],
            }),
        ],
        exports: [config_1.ConfigModule],
    })
], ConfigModule);
//# sourceMappingURL=config.module.js.map