import { FileService } from './file.service';
import { FileQueryDto } from './dto/file-query.dto';
import { FileResponseDto } from './dto/file-response.dto';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    uploadFile(file: Express.Multer.File, user: {
        id: string;
    }): Promise<FileResponseDto>;
    findAll(query: FileQueryDto, user?: {
        id: string;
    }): Promise<{
        data: FileResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user?: {
        id: string;
    }): Promise<FileResponseDto>;
    getSignedUrl(id: string, expiresIn?: string, user?: {
        id: string;
    }): Promise<{
        url: string;
    }>;
    remove(id: string, user: {
        id: string;
    }): Promise<void>;
}
