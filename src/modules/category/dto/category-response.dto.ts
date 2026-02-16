import { Category, File } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryImageDto {
  @ApiProperty({ example: '59fd6deb-0728-4aff-852a-33908e8c657b' })
  id!: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  url!: string;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'cm5h1234567890' })
  id!: string;

  @ApiProperty({ example: 'Flowers' })
  name!: string;

  @ApiProperty({ example: 'flowers' })
  slug!: string;

  @ApiProperty({ example: 'Fresh and beautiful flowers', nullable: true })
  description!: string | null;

  @ApiProperty({ type: () => CategoryImageDto, nullable: true })
  image!: CategoryImageDto | null;

  @ApiProperty({ example: null, nullable: true })
  parentId!: string | null;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 12 })
  activeProductCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: () => [CategoryResponseDto], required: false })
  children?: CategoryResponseDto[];

  static fromEntity(
    category: Category & {
      children?: (Category & { image?: File | null })[];
      image?: File | null;
      activeProductCount?: number;
    },
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name as unknown as string,
      slug: category.slug,
      description: category.description as unknown as string | null,
      image: category.image
        ? { id: category.image.id, url: category.image.url }
        : null,
      parentId: category.parentId,
      order: category.order,
      isActive: category.isActive,
      activeProductCount: category.activeProductCount ?? 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      deletedAt: category.deletedAt,
      children: category.children
        ? category.children.map((child) =>
            CategoryResponseDto.fromEntity(child),
          )
        : undefined,
    };
  }
}
