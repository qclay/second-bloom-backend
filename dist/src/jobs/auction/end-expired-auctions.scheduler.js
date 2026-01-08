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
var EndExpiredAuctionsScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndExpiredAuctionsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
let EndExpiredAuctionsScheduler = EndExpiredAuctionsScheduler_1 = class EndExpiredAuctionsScheduler {
    auctionQueue;
    logger = new common_1.Logger(EndExpiredAuctionsScheduler_1.name);
    constructor(auctionQueue) {
        this.auctionQueue = auctionQueue;
    }
    async scheduleEndExpiredAuctions() {
        this.logger.log('Scheduling end expired auctions job');
        try {
            await this.auctionQueue.add('end-expired', {
                timestamp: Date.now(),
            });
        }
        catch (error) {
            this.logger.error('Failed to schedule end expired auctions job', error instanceof Error ? error.stack : error);
        }
    }
};
exports.EndExpiredAuctionsScheduler = EndExpiredAuctionsScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EndExpiredAuctionsScheduler.prototype, "scheduleEndExpiredAuctions", null);
exports.EndExpiredAuctionsScheduler = EndExpiredAuctionsScheduler = EndExpiredAuctionsScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('auction')),
    __metadata("design:paramtypes", [Object])
], EndExpiredAuctionsScheduler);
//# sourceMappingURL=end-expired-auctions.scheduler.js.map