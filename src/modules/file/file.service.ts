import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FileRepository } from './repositories/file.repository';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { FileResponseDto } from './dto/file-response.dto';
import { FileType, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileType = this.detectFileType(file.mimetype);
    const sanitizedOriginalName = this.sanitizeFilename(file.originalname);
    const fileExtension = path.extname(sanitizedOriginalName).toLowerCase();
    const filename = `${uuidv4()}${fileExtension}`;
    const folder = this.getFolderForFileType(fileType);
    const key = `${folder}/${filename}`;

    let width: number | null = null;
    let height: number | null = null;

    if (fileType === FileType.IMAGE) {
      try {
        const metadata = await sharp(file.buffer).metadata();
        width = metadata.width || null;
        height = metadata.height || null;
      } catch (error) {
        this.logger.warn(
          `Failed to extract image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    let fileUrl: string;
    try {
      fileUrl = await this.storageService.uploadFile(
        file.buffer,
        key,
        file.mimetype,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upload file to storage: ${key}`,
        error instanceof Error ? error.stack : error,
      );
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    try {
      const fileData = await this.fileRepository.create({
        url: fileUrl,
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
        metadata: this.extractMetadata(file) as Prisma.InputJsonValue,
      });

      return FileResponseDto.fromEntity(fileData);
    } catch (error) {
      this.logger.error(
        `Failed to create file record in database: ${key}`,
        error instanceof Error ? error.stack : error,
      );
      await this.storageService.deleteFile(key).catch((deleteError) => {
        this.logger.error(
          `Failed to cleanup S3 file after DB error: ${key}`,
          deleteError,
        );
      });
      throw new BadRequestException(
        `Failed to save file record: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

  private getFolderForFileType(fileType: FileType): string {
    const folderMap: Record<FileType, string> = {
      IMAGE: 'images',
      DOCUMENT: 'documents',
      VIDEO: 'videos',
      AUDIO: 'audio',
      OTHER: 'others',
    };
    return folderMap[fileType] || 'others';
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/\/|\\/g, '_')
      .substring(0, 255);
  }

  private extractMetadata(file: Express.Multer.File): Record<string, unknown> {
    return {
      originalName: file.originalname,
      encoding: file.encoding,
      fieldname: file.fieldname,
    };
  }
}
