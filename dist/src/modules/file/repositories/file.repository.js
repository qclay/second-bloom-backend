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
exports.FileRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let FileRepository = class FileRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.file.findUnique({
            where: { id },
        });
    }
    async findByKey(key) {
        return this.prisma.file.findFirst({
            where: { key, deletedAt: null },
        });
    }
    async findByUrl(url) {
        return this.prisma.file.findUnique({
            where: { url },
        });
    }
    async create(data) {
        return this.prisma.file.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.file.update({
            where: { id },
            data,
        });
    }
    async softDelete(id, deletedBy) {
        return this.prisma.file.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy,
            },
        });
    }
    async findMany(args) {
        return this.prisma.file.findMany(args);
    }
    async count(args) {
        return this.prisma.file.count(args);
    }
};
exports.FileRepository = FileRepository;
exports.FileRepository = FileRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileRepository);
//# sourceMappingURL=file.repository.js.map