import { FileRepository } from './repositories/file.repository';
import { AwsService } from '../../infrastructure/aws/aws.service';
import { FileQueryDto } from './dto/file-query.dto';
import { FileResponseDto } from './dto/file-response.dto';
export declare class FileService {
    private readonly fileRepository;
    private readonly awsService;
    private readonly logger;
    constructor(fileRepository: FileRepository, awsService: AwsService);
    uploadFile(file: Express.Multer.File, userId: string): Promise<FileResponseDto>;
    private detectFileType;
    findById(id: string, userId?: string): Promise<FileResponseDto>;
    findAll(query: FileQueryDto, userId?: string): Promise<{
        data: FileResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    deleteFile(id: string, userId: string): Promise<void>;
    getSignedUrl(id: string, userId?: string, expiresIn?: number): Promise<string>;
    private getFolderForFileType;
    private sanitizeFilename;
    private extractMetadata;
}
