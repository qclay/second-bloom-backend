import { FileType } from '@prisma/client';

export interface FileTypeConfig {
  maxSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const FILE_UPLOAD_CONFIG: Record<FileType, FileTypeConfig> = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
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
    maxSize: 100 * 1024 * 1024, // 100MB
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
    maxSize: 20 * 1024 * 1024, // 20MB
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
    maxSize: 10 * 1024 * 1024, // 10MB
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
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [], // Allow any
    allowedExtensions: [], // Allow any
  },
};

export const getFileTypeConfig = (fileType: FileType): FileTypeConfig => {
  return FILE_UPLOAD_CONFIG[fileType];
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};
