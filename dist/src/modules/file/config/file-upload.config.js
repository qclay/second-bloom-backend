"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFileSize = exports.getFileTypeConfig = exports.FILE_UPLOAD_CONFIG = void 0;
exports.FILE_UPLOAD_CONFIG = {
    IMAGE: {
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    },
    VIDEO: {
        maxSize: 100 * 1024 * 1024,
        allowedMimeTypes: [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'video/webm',
        ],
        allowedExtensions: ['mp4', 'mpeg', 'mov', 'avi', 'webm'],
    },
    AUDIO: {
        maxSize: 20 * 1024 * 1024,
        allowedMimeTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/webm',
        ],
        allowedExtensions: ['mp3', 'wav', 'ogg', 'webm'],
    },
    DOCUMENT: {
        maxSize: 10 * 1024 * 1024,
        allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
        ],
        allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    },
    OTHER: {
        maxSize: 10 * 1024 * 1024,
        allowedMimeTypes: [],
        allowedExtensions: [],
    },
};
const getFileTypeConfig = (fileType) => {
    return exports.FILE_UPLOAD_CONFIG[fileType];
};
exports.getFileTypeConfig = getFileTypeConfig;
const formatFileSize = (bytes) => {
    if (bytes < 1024)
        return `${bytes}B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};
exports.formatFileSize = formatFileSize;
//# sourceMappingURL=file-upload.config.js.map