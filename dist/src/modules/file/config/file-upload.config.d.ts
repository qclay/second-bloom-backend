import { FileType } from '@prisma/client';
export interface FileTypeConfig {
    maxSize: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
}
export declare const FILE_UPLOAD_CONFIG: Record<FileType, FileTypeConfig>;
export declare const getFileTypeConfig: (fileType: FileType) => FileTypeConfig;
export declare const formatFileSize: (bytes: number) => string;
