"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidationInterceptor = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const file_upload_config_1 = require("../config/file-upload.config");
let FileValidationInterceptor = class FileValidationInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const file = request.file;
        if (!file) {
            return next.handle();
        }
        const fileType = this.detectFileType(file.mimetype);
        const config = (0, file_upload_config_1.getFileTypeConfig)(fileType);
        if (file.size > config.maxSize) {
            throw new common_1.BadRequestException(`File size (${(0, file_upload_config_1.formatFileSize)(file.size)}) exceeds maximum allowed size of ${(0, file_upload_config_1.formatFileSize)(config.maxSize)}`);
        }
        if (config.allowedMimeTypes.length > 0 &&
            !config.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`);
        }
        const fileExtension = this.getFileExtension(file.originalname);
        if (config.allowedExtensions.length > 0 &&
            !config.allowedExtensions.includes(fileExtension)) {
            throw new common_1.BadRequestException(`File extension .${fileExtension} is not allowed. Allowed extensions: ${config.allowedExtensions.map((ext) => `.${ext}`).join(', ')}`);
        }
        return next.handle();
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
    getFileExtension(filename) {
        return filename.toLowerCase().split('.').pop() || '';
    }
    isValidExtension(extension, fileType, mimeType) {
        const extensionMap = {
            jpg: ['image/jpeg', 'image/jpg'],
            jpeg: ['image/jpeg', 'image/jpg'],
            png: ['image/png'],
            gif: ['image/gif'],
            webp: ['image/webp'],
            svg: ['image/svg+xml'],
            pdf: ['application/pdf'],
            doc: ['application/msword'],
            docx: [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            xls: ['application/vnd.ms-excel'],
            xlsx: [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
            txt: ['text/plain'],
            mp4: ['video/mp4'],
            mpeg: ['video/mpeg'],
            mov: ['video/quicktime'],
            avi: ['video/x-msvideo'],
            webm: ['video/webm'],
            mp3: ['audio/mpeg', 'audio/mp3'],
            wav: ['audio/wav'],
            ogg: ['audio/ogg'],
        };
        const allowedMimeTypes = extensionMap[extension];
        if (!allowedMimeTypes) {
            return fileType === client_1.FileType.OTHER;
        }
        return allowedMimeTypes.includes(mimeType);
    }
};
exports.FileValidationInterceptor = FileValidationInterceptor;
exports.FileValidationInterceptor = FileValidationInterceptor = __decorate([
    (0, common_1.Injectable)()
], FileValidationInterceptor);
//# sourceMappingURL=file-validation.interceptor.js.map