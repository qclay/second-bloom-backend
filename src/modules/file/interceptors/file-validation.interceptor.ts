import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileType } from '@prisma/client';
import {
  getFileTypeConfig,
  formatFileSize,
} from '../config/file-upload.config';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const file = request.file as Express.Multer.File | undefined;

    if (!file) {
      return next.handle();
    }

    const fileType = this.detectFileType(file.mimetype);
    const config = getFileTypeConfig(fileType);

    if (file.size > config.maxSize) {
      throw new BadRequestException(
        `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of ${formatFileSize(config.maxSize)}`,
      );
    }

    if (
      config.allowedMimeTypes.length > 0 &&
      !config.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
      );
    }

    const fileExtension = this.getFileExtension(file.originalname);
    if (
      config.allowedExtensions.length > 0 &&
      !config.allowedExtensions.includes(fileExtension)
    ) {
      throw new BadRequestException(
        `File extension .${fileExtension} is not allowed. Allowed extensions: ${config.allowedExtensions.map((ext) => `.${ext}`).join(', ')}`,
      );
    }

    return next.handle();
  }

  private detectFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }
    if (mimeType.startsWith('video/')) {
      return FileType.VIDEO;
    }
    if (mimeType.startsWith('audio/')) {
      return FileType.AUDIO;
    }
    if (
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('sheet') ||
      mimeType === 'text/plain'
    ) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }

  private getFileExtension(filename: string): string {
    return filename.toLowerCase().split('.').pop() || '';
  }

  private isValidExtension(
    extension: string,
    fileType: FileType,
    mimeType: string,
  ): boolean {
    const extensionMap: Record<string, string[]> = {
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
      return fileType === FileType.OTHER;
    }

    return allowedMimeTypes.includes(mimeType);
  }
}
