import { FileType, EntityType } from '@prisma/client';
export declare class FileQueryDto {
    fileType?: FileType;
    entityType?: EntityType;
    entityId?: string;
    page?: number;
    limit?: number;
}
