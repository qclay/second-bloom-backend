import { File } from '@prisma/client';
export declare class FileResponseDto {
    id: string;
    url: string;
    key: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    fileType: string;
    entityType: string | null;
    entityId: string | null;
    uploadedById: string | null;
    isPublic: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(file: File): FileResponseDto;
}
