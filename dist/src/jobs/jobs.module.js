"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const auction_module_1 = require("../modules/auction/auction.module");
const auth_module_1 = require("../modules/auth/auth.module");
const end_expired_auctions_processor_1 = require("./auction/end-expired-auctions.processor");
const end_expired_auctions_scheduler_1 = require("./auction/end-expired-auctions.scheduler");
const clean_expired_otps_processor_1 = require("./auth/clean-expired-otps.processor");
const clean_expired_otps_scheduler_1 = require("./auth/clean-expired-otps.scheduler");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            schedule_1.ScheduleModule.forRoot(),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const redisConfig = configService.get('redis');
                    if (!redisConfig) {
                        throw new Error('Redis configuration is missing');
                    }
                    const redisUrl = new URL(redisConfig.url);
                    return {
                        redis: {
                            host: redisUrl.hostname,
                            port: parseInt(redisUrl.port || '6379', 10),
                            password: redisUrl.password || redisConfig.password,
                        },
                        defaultJobOptions: {
                            removeOnComplete: true,
                            removeOnFail: false,
                            attempts: 3,
                            backoff: {
                                type: 'exponential',
                                delay: 2000,
                            },
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            bull_1.BullModule.registerQueue({
                name: 'auction',
            }),
            bull_1.BullModule.registerQueue({
                name: 'auth',
            }),
            auction_module_1.AuctionModule,
            auth_module_1.AuthModule,
        ],
        providers: [
            end_expired_auctions_processor_1.EndExpiredAuctionsProcessor,
            end_expired_auctions_scheduler_1.EndExpiredAuctionsScheduler,
            clean_expired_otps_processor_1.CleanExpiredOtpsProcessor,
            clean_expired_otps_scheduler_1.CleanExpiredOtpsScheduler,
        ],
        exports: [bull_1.BullModule],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map