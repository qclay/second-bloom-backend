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
var CleanExpiredOtpsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanExpiredOtpsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CleanExpiredOtpsProcessor = CleanExpiredOtpsProcessor_1 = class CleanExpiredOtpsProcessor {
    prisma;
    logger = new common_1.Logger(CleanExpiredOtpsProcessor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleCleanExpiredOtps(job) {
        this.logger.log(`Processing clean expired OTPs job ${job.id} at ${new Date(job.data.timestamp).toISOString()}`);
        try {
            const now = new Date();
            const result = await this.prisma.verificationCode.deleteMany({
                where: {
                    OR: [{ expiresAt: { lt: now } }, { isUsed: true }],
                },
            });
            this.logger.log(`Successfully cleaned ${result.count} expired/used OTPs (Job ${job.id})`);
        }
        catch (error) {
            this.logger.error(`Failed to clean expired OTPs (Job ${job.id})`, error instanceof Error ? error.stack : error);
            throw error;
        }
    }
};
exports.CleanExpiredOtpsProcessor = CleanExpiredOtpsProcessor;
__decorate([
    (0, bull_1.Process)('clean-expired-otps'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CleanExpiredOtpsProcessor.prototype, "handleCleanExpiredOtps", null);
exports.CleanExpiredOtpsProcessor = CleanExpiredOtpsProcessor = CleanExpiredOtpsProcessor_1 = __decorate([
    (0, bull_1.Processor)('auth'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CleanExpiredOtpsProcessor);
//# sourceMappingURL=clean-expired-otps.processor.js.map