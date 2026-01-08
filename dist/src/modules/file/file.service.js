"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var FileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const file_repository_1 = require("./repositories/file.repository");
const aws_service_1 = require("../../infrastructure/aws/aws.service");
const file_response_dto_1 = require("./dto/file-response.dto");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
let FileService = FileService_1 = class FileService {
    fileRepository;
    awsService;
    logger = new common_1.Logger(FileService_1.name);
    constructor(fileRepository, awsService) {
        this.fileRepository = fileRepository;
        this.awsService = awsService;
    }
    async uploadFile(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        console.log(file);
        const fileType = this.detectFileType(file.mimetype);
        const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
        const fileExtension = path.extname(sanitizedOriginalName).toLowerCase();
        const filename = `${(0, uuid_1.v4)()}${fileExtension}`;
        const folder = this.getFolderForFileType(fileType);
        const key = `${folder}/${filename}`;
        let width = null;
        let height = null;
        if (fileType === client_1.FileType.IMAGE) {
            try {
                const metadata = await (0, sharp_1.default)(file.buffer).metadata();
                width = metadata.width || null;
                height = metadata.height || null;
            }
            catch (error) {
                this.logger.warn(`Failed to extract image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        let s3Url;
        try {
            s3Url = await this.awsService.uploadFile(file.buffer, key, file.mimetype);
        }
        catch (error) {
            this.logger.error(`Failed to upload file to S3: ${key}`, error instanceof Error ? error.stack : error);
            throw new common_1.BadRequestException(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        try {
            const fileData = await this.fileRepository.create({
                url: s3Url,
                key,
                filename,
                originalName: sanitizedOriginalName,
                mimeType: file.mimetype,
                size: file.size,
                width,
                height,
                fileType,
                uploadedBy: userId
                    ? {
                        connect: { id: userId },
                    }
                    : undefined,
                isPublic: true,
                metadata: this.extractMetadata(file),
            });
            return file_response_dto_1.FileResponseDto.fromEntity(fileData);
        }
        catch (error) {
            this.logger.error(`Failed to create file record in database: ${key}`, error instanceof Error ? error.stack : error);
            await this.awsService.deleteFile(key).catch((deleteError) => {
                this.logger.error(`Failed to cleanup S3 file after DB error: ${key}`, deleteError);
            });
            throw new common_1.BadRequestException(`Failed to save file record: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    detectFileType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return client_1.FileType.IMAGE;
        }
        if (mimeType.startsWith('video/')) {
            return client_1.FileType.VIDEO;
        }
        if (mimeType.startsWith('audio/')) {
            return client_1.FileType.AUDIO;
        }
        if (mimeType === 'application/pdf' ||
            mimeType.includes('document') ||
            mimeType.includes('word') ||
            mimeType.includes('excel') ||
            mimeType.includes('sheet') ||
            mimeType === 'text/plain') {
            return client_1.FileType.DOCUMENT;
        }
        return client_1.FileType.OTHER;
    }
    async findById(id, userId) {
        const file = await this.fileRepository.findById(id);
        if (!file) {
            throw new common_1.NotFoundException(`File with ID ${id} not found`);
        }
        if (file.deletedAt) {
            throw new common_1.NotFoundException(`File with ID ${id} not found`);
        }
        if (!file.isPublic && file.uploadedById !== userId) {
            throw new common_1.ForbiddenException('Access denied to this file');
        }
        return file_response_dto_1.FileResponseDto.fromEntity(file);
    }
    async findAll(query, userId) {
        const { page = 1, limit = 20, fileType, entityType, entityId } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            deletedAt: null,
        };
        if (fileType) {
            where.fileType = fileType;
        }
        if (entityType) {
            where.entityType = entityType;
        }
        if (entityId) {
            where.entityId = entityId;
        }
        if (!userId) {
            where.isPublic = true;
        }
        else {
            where.OR = [{ isPublic: true }, { uploadedById: userId }];
        }
        const [files, total] = await Promise.all([
            this.fileRepository.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy: { createdAt: 'desc' },
            }),
            this.fileRepository.count({ where }),
        ]);
        return {
            data: files.map((file) => file_response_dto_1.FileResponseDto.fromEntity(file)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async deleteFile(id, userId) {
        const file = await this.fileRepository.findById(id);
        if (!file || file.deletedAt) {
            throw new common_1.NotFoundException(`File with ID ${id} not found`);
        }
        if (file.uploadedById !== userId) {
            throw new common_1.ForbiddenException('Only the file owner can delete it');
        }
        const s3Deleted = await this.awsService.deleteFile(file.key);
        if (!s3Deleted) {
            this.logger.warn(`Failed to delete file from S3: ${file.key}, but continuing with DB deletion`);
        }
        await this.fileRepository.softDelete(id, userId);
    }
    async getSignedUrl(id, userId, expiresIn) {
        const file = await this.fileRepository.findById(id);
        if (!file || file.deletedAt) {
            throw new common_1.NotFoundException(`File with ID ${id} not found`);
        }
        if (!file.isPublic && file.uploadedById !== userId) {
            throw new common_1.ForbiddenException('Access denied to this file');
        }
        return this.awsService.getSignedUrl(file.key, expiresIn);
    }
    getFolderForFileType(fileType) {
        const folderMap = {
            IMAGE: 'images',
            DOCUMENT: 'documents',
            VIDEO: 'videos',
            AUDIO: 'audio',
            OTHER: 'others',
        };
        return folderMap[fileType] || 'others';
    }
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/\.\./g, '_')
            .replace(/\/|\\/g, '_')
            .substring(0, 255);
    }
    extractMetadata(file) {
        return {
            originalName: file.originalname,
            encoding: file.encoding,
            fieldname: file.fieldname,
        };
    }
};
exports.FileService = FileService;
exports.FileService = FileService = FileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [file_repository_1.FileRepository,
        aws_service_1.AwsService])
], FileService);
//# sourceMappingURL=file.service.js.map