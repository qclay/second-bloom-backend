import { File } from '@prisma/client';

export class FileResponseDto {
  id!: string;
  url!: string;
  key!: string;
  filename!: string;
  originalName!: string;
  mimeType!: string;
  size!: number;
  width!: number | null;
  height!: number | null;
  fileType!: string;
  entityType!: string | null;
  entityId!: string | null;
  uploadedById!: string | null;
  isPublic!: boolean;
  metadata!: Record<string, unknown> | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(file: File): FileResponseDto {
    return {
      id: file.id,
      url: file.url,
      key: file.key,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      width: file.width,
      height: file.height,
      fileType: file.fileType,
      entityType: file.entityType,
      entityId: file.entityId,
      uploadedById: file.uploadedById,
      isPublic: file.isPublic,
      metadata: file.metadata as Record<string, unknown> | null,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }
}
