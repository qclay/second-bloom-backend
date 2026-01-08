import { Category, File } from '@prisma/client';
import { FileResponseDto } from '../../file/dto/file-response.dto';
export declare class CategoryResponseDto {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: FileResponseDto | null;
    parentId: string | null;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    children?: CategoryResponseDto[];
    static fromEntity(category: Category & {
        children?: (Category & {
            image?: File | null;
        })[];
        image?: File | null;
    }): CategoryResponseDto;
}
