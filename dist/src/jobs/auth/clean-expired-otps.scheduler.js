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
var CleanExpiredOtpsScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanExpiredOtpsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
let CleanExpiredOtpsScheduler = CleanExpiredOtpsScheduler_1 = class CleanExpiredOtpsScheduler {
    authQueue;
    logger = new common_1.Logger(CleanExpiredOtpsScheduler_1.name);
    constructor(authQueue) {
        this.authQueue = authQueue;
    }
    async scheduleCleanExpiredOtps() {
        this.logger.log('Scheduling clean expired OTPs job');
        try {
            await this.authQueue.add('clean-expired-otps', {
                timestamp: Date.now(),
            });
        }
        catch (error) {
            this.logger.error('Failed to schedule clean expired OTPs job', error instanceof Error ? error.stack : error);
        }
    }
};
exports.CleanExpiredOtpsScheduler = CleanExpiredOtpsScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanExpiredOtpsScheduler.prototype, "scheduleCleanExpiredOtps", null);
exports.CleanExpiredOtpsScheduler = CleanExpiredOtpsScheduler = CleanExpiredOtpsScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('auth')),
    __metadata("design:paramtypes", [Object])
], CleanExpiredOtpsScheduler);
//# sourceMappingURL=clean-expired-otps.scheduler.js.map