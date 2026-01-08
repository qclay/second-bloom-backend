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
var EndExpiredAuctionsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndExpiredAuctionsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const auction_service_1 = require("../../modules/auction/auction.service");
let EndExpiredAuctionsProcessor = EndExpiredAuctionsProcessor_1 = class EndExpiredAuctionsProcessor {
    auctionService;
    logger = new common_1.Logger(EndExpiredAuctionsProcessor_1.name);
    constructor(auctionService) {
        this.auctionService = auctionService;
    }
    async handleEndExpired(job) {
        this.logger.log(`Processing end expired auctions job ${job.id} at ${new Date(job.data.timestamp).toISOString()}`);
        try {
            const endedCount = await this.auctionService.endExpiredAuctions();
            this.logger.log(`Successfully ended ${endedCount} expired auctions (Job ${job.id})`);
        }
        catch (error) {
            this.logger.error(`Failed to end expired auctions (Job ${job.id})`, error instanceof Error ? error.stack : error);
            throw error;
        }
    }
};
exports.EndExpiredAuctionsProcessor = EndExpiredAuctionsProcessor;
__decorate([
    (0, bull_1.Process)('end-expired'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EndExpiredAuctionsProcessor.prototype, "handleEndExpired", null);
exports.EndExpiredAuctionsProcessor = EndExpiredAuctionsProcessor = EndExpiredAuctionsProcessor_1 = __decorate([
    (0, bull_1.Processor)('auction'),
    __metadata("design:paramtypes", [auction_service_1.AuctionService])
], EndExpiredAuctionsProcessor);
//# sourceMappingURL=end-expired-auctions.processor.js.map