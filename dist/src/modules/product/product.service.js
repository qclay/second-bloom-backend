"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const product_repository_1 = require("./repositories/product.repository");
const product_response_dto_1 = require("./dto/product-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const category_repository_1 = require("../category/repositories/category.repository");
let ProductService = class ProductService {
    productRepository;
    categoryRepository;
    prisma;
    constructor(productRepository, categoryRepository, prisma) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.prisma = prisma;
    }
    async createProduct(dto, sellerId) {
        const category = await this.categoryRepository.findById(dto.categoryId);
        if (!category || category.deletedAt || !category.isActive) {
            throw new common_1.NotFoundException('Category not found or inactive');
        }
        const slug = this.generateSlug(dto.title);
        const existingProduct = await this.productRepository.findBySlug(slug);
        if (existingProduct) {
            throw new common_1.ConflictException('Product with this title already exists');
        }
        const validatedImageIds = dto.imageIds
            ? this.validateAndDeduplicateImages(dto.imageIds)
            : undefined;
        if (validatedImageIds && validatedImageIds.length > 0) {
            await this.validateImagesExist(validatedImageIds);
        }
        const product = await this.prisma.$transaction(async (tx) => {
            const createdProduct = await tx.product.create({
                data: {
                    title: dto.title,
                    slug,
                    description: dto.description,
                    price: dto.price,
                    currency: dto.currency ?? 'UZS',
                    category: {
                        connect: { id: dto.categoryId },
                    },
                    tags: dto.tags ?? [],
                    type: dto.type ?? 'FRESH',
                    condition: dto.condition,
                    quantity: dto.quantity ?? 1,
                    status: dto.status ?? client_1.ProductStatus.ACTIVE,
                    isFeatured: dto.isFeatured ?? false,
                    region: dto.region,
                    city: dto.city,
                    district: dto.district,
                    seller: {
                        connect: { id: sellerId },
                    },
                },
            });
            if (validatedImageIds && validatedImageIds.length > 0) {
                await tx.productImage.createMany({
                    data: validatedImageIds.map((fileId, index) => ({
                        productId: createdProduct.id,
                        fileId,
                        order: index,
                    })),
                });
            }
            return createdProduct;
        });
        return this.findById(product.id);
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, categoryId, sellerId, isFeatured, type, status, region, city, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (sellerId) {
            where.sellerId = sellerId;
        }
        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }
        if (type) {
            where.type = type;
        }
        if (status) {
            where.status = status;
        }
        if (region) {
            where.region = region;
        }
        if (city) {
            where.city = city;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            if (minPrice !== undefined &&
                maxPrice !== undefined &&
                minPrice > maxPrice) {
                throw new common_1.BadRequestException('minPrice must be less than or equal to maxPrice');
            }
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
        const orderBy = {};
        if (sortBy === 'price') {
            orderBy.price = sortOrder;
        }
        else if (sortBy === 'views') {
            orderBy.views = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [products, total] = await Promise.all([
            this.productRepository.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    seller: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                        },
                    },
                    images: {
                        include: {
                            file: {
                                select: {
                                    url: true,
                                },
                            },
                        },
                        orderBy: { order: 'asc' },
                    },
                },
            }),
            this.productRepository.count({ where }),
        ]);
        return {
            data: products.map((product) => product_response_dto_1.ProductResponseDto.fromEntity(product)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
                hasNextPage: page * maxLimit < total,
                hasPreviousPage: page > 1,
            },
        };
    }
    async searchProducts(query) {
        const { page = 1, limit = 20, search, categoryId, categoryIds, sellerId, sellerIds, isFeatured, type, types, status, statuses, region, regions, city, cities, district, minPrice, maxPrice, tags, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        else if (categoryIds && categoryIds.length > 0) {
            where.categoryId = { in: categoryIds };
        }
        if (sellerId) {
            where.sellerId = sellerId;
        }
        else if (sellerIds && sellerIds.length > 0) {
            where.sellerId = { in: sellerIds };
        }
        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }
        if (type) {
            where.type = type;
        }
        else if (types && types.length > 0) {
            where.type = { in: types };
        }
        if (status) {
            where.status = status;
        }
        else if (statuses && statuses.length > 0) {
            where.status = { in: statuses };
        }
        if (region) {
            where.region = region;
        }
        else if (regions && regions.length > 0) {
            where.region = { in: regions };
        }
        if (city) {
            where.city = city;
        }
        else if (cities && cities.length > 0) {
            where.city = { in: cities };
        }
        if (district) {
            where.district = district;
        }
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            if (minPrice !== undefined &&
                maxPrice !== undefined &&
                minPrice > maxPrice) {
                throw new common_1.BadRequestException('minPrice must be less than or equal to maxPrice');
            }
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
        const orderBy = {};
        if (sortBy === 'price') {
            orderBy.price = sortOrder;
        }
        else if (sortBy === 'views') {
            orderBy.views = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else if (sortBy === 'updatedAt') {
            orderBy.updatedAt = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [products, total] = await Promise.all([
            this.productRepository.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    seller: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                        },
                    },
                    images: {
                        include: {
                            file: {
                                select: {
                                    url: true,
                                },
                            },
                        },
                        orderBy: { order: 'asc' },
                    },
                },
            }),
            this.productRepository.count({ where }),
        ]);
        return {
            data: products.map((product) => product_response_dto_1.ProductResponseDto.fromEntity(product)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
                hasNextPage: page * maxLimit < total,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findById(id, incrementViews = false) {
        const productWithRelations = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                    },
                },
                images: {
                    include: {
                        file: {
                            select: {
                                url: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!productWithRelations) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (productWithRelations.deletedAt) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (incrementViews) {
            await this.productRepository.incrementViews(id);
        }
        return product_response_dto_1.ProductResponseDto.fromEntity(productWithRelations);
    }
    async updateProduct(id, dto, userId, userRole) {
        const product = await this.productRepository.findById(id);
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (product.sellerId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own products');
        }
        const updateData = {};
        if (dto.title && dto.title !== product.title) {
            const slug = this.generateSlug(dto.title);
            const existingProduct = await this.productRepository.findBySlug(slug);
            if (existingProduct && existingProduct.id !== id) {
                throw new common_1.ConflictException('Product with this title already exists');
            }
            updateData.slug = slug;
            updateData.title = dto.title;
        }
        if (dto.categoryId && dto.categoryId !== product.categoryId) {
            const category = await this.categoryRepository.findById(dto.categoryId);
            if (!category || category.deletedAt || !category.isActive) {
                throw new common_1.NotFoundException('Category not found or inactive');
            }
        }
        const validatedImageIds = dto.imageIds !== undefined
            ? this.validateAndDeduplicateImages(dto.imageIds)
            : undefined;
        if (validatedImageIds && validatedImageIds.length > 0) {
            const existingProductImages = await this.prisma.productImage.findMany({
                where: { productId: id },
                select: { fileId: true },
            });
            const existingFileIds = new Set(existingProductImages.map((img) => img.fileId));
            const newImageIds = validatedImageIds.filter((id) => !existingFileIds.has(id));
            if (newImageIds.length > 0) {
                await this.validateImagesExist(newImageIds);
            }
        }
        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }
        if (dto.price !== undefined) {
            updateData.price = dto.price;
        }
        if (dto.currency !== undefined) {
            updateData.currency = dto.currency;
        }
        if (dto.categoryId !== undefined) {
            updateData.category = { connect: { id: dto.categoryId } };
        }
        if (dto.tags !== undefined) {
            updateData.tags = dto.tags;
        }
        if (dto.type !== undefined) {
            updateData.type = dto.type;
        }
        if (dto.condition !== undefined) {
            updateData.condition = dto.condition;
        }
        if (dto.quantity !== undefined) {
            updateData.quantity = dto.quantity;
        }
        if (dto.status !== undefined) {
            updateData.status = dto.status;
        }
        if (dto.isFeatured !== undefined) {
            updateData.isFeatured = dto.isFeatured;
        }
        if (dto.region !== undefined) {
            updateData.region = dto.region;
        }
        if (dto.city !== undefined) {
            updateData.city = dto.city;
        }
        if (dto.district !== undefined) {
            updateData.district = dto.district;
        }
        if (validatedImageIds !== undefined || Object.keys(updateData).length > 0) {
            await this.prisma.$transaction(async (tx) => {
                if (Object.keys(updateData).length > 0) {
                    await tx.product.update({
                        where: { id },
                        data: updateData,
                    });
                }
                if (validatedImageIds !== undefined) {
                    await tx.productImage.deleteMany({
                        where: { productId: id },
                    });
                    if (validatedImageIds.length > 0) {
                        await tx.productImage.createMany({
                            data: validatedImageIds.map((fileId, index) => ({
                                productId: id,
                                fileId,
                                order: index,
                            })),
                        });
                    }
                }
            });
        }
        return this.findById(id);
    }
    async deleteProduct(id, userId, userRole) {
        const product = await this.productRepository.findById(id);
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (product.sellerId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own products');
        }
        const activeAuctions = await this.prisma.auction.count({
            where: {
                productId: id,
                status: 'ACTIVE',
            },
        });
        if (activeAuctions > 0) {
            throw new common_1.BadRequestException('Cannot delete product with active auctions');
        }
        await this.productRepository.softDelete(id, userId);
    }
    generateSlug(title) {
        const baseSlug = title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        if (!baseSlug) {
            throw new common_1.BadRequestException('Product title must contain at least one alphanumeric character');
        }
        return baseSlug;
    }
    validateAndDeduplicateImages(imageIds) {
        if (imageIds.length === 0) {
            return [];
        }
        if (imageIds.length > 10) {
            throw new common_1.BadRequestException('Maximum 10 images allowed per product');
        }
        const uniqueImageIds = [...new Set(imageIds)];
        if (uniqueImageIds.length !== imageIds.length) {
            throw new common_1.BadRequestException('Duplicate images are not allowed');
        }
        return uniqueImageIds;
    }
    async validateImagesExist(imageIds) {
        if (imageIds.length === 0) {
            return;
        }
        const files = await this.prisma.file.findMany({
            where: {
                id: { in: imageIds },
                deletedAt: null,
            },
        });
        if (files.length !== imageIds.length) {
            const foundIds = new Set(files.map((f) => f.id));
            const missingIds = imageIds.filter((id) => !foundIds.has(id));
            throw new common_1.NotFoundException(`Images not found: ${missingIds.join(', ')}`);
        }
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_repository_1.ProductRepository,
        category_repository_1.CategoryRepository,
        prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map