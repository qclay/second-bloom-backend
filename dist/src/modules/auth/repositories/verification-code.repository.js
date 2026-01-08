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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationCodeRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let VerificationCodeRepository = class VerificationCodeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.verificationCode.create({
            data,
        });
    }
    async findValid(phoneNumber, code, purpose) {
        return this.prisma.verificationCode.findFirst({
            where: {
                phoneNumber,
                code,
                purpose,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async markAsUsed(id) {
        return this.prisma.verificationCode.update({
            where: { id },
            data: { isUsed: true },
        });
    }
    async incrementAttempts(id) {
        return this.prisma.verificationCode.update({
            where: { id },
            data: {
                attempts: {
                    increment: 1,
                },
            },
        });
    }
    async deleteExpired() {
        const result = await this.prisma.verificationCode.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    }
    async findLatestByPhone(phoneNumber, purpose) {
        return this.prisma.verificationCode.findFirst({
            where: {
                phoneNumber,
                purpose,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.VerificationCodeRepository = VerificationCodeRepository;
exports.VerificationCodeRepository = VerificationCodeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VerificationCodeRepository);
//# sourceMappingURL=verification-code.repository.js.map