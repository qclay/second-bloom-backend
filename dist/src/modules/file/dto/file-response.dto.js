"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class FileResponseDto {
    id;
    url;
    key;
    filename;
    originalName;
    mimeType;
    size;
    width;
    height;
    fileType;
    entityType;
    entityId;
    uploadedById;
    isPublic;
    metadata;
    createdAt;
    updatedAt;
    static fromEntity(file) {
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
            metadata: file.metadata,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, url: { required: true, type: () => String }, key: { required: true, type: () => String }, filename: { required: true, type: () => String }, originalName: { required: true, type: () => String }, mimeType: { required: true, type: () => String }, size: { required: true, type: () => Number }, width: { required: true, type: () => Number, nullable: true }, height: { required: true, type: () => Number, nullable: true }, fileType: { required: true, type: () => String }, entityType: { required: true, type: () => String, nullable: true }, entityId: { required: true, type: () => String, nullable: true }, uploadedById: { required: true, type: () => String, nullable: true }, isPublic: { required: true, type: () => Boolean }, metadata: { required: true, type: () => Object, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.FileResponseDto = FileResponseDto;
//# sourceMappingURL=file-response.dto.js.map