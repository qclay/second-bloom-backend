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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const category_repository_1 = require("./repositories/category.repository");
const category_response_dto_1 = require("./dto/category-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let CategoryService = class CategoryService {
    categoryRepository;
    prisma;
    constructor(categoryRepository, prisma) {
        this.categoryRepository = categoryRepository;
        this.prisma = prisma;
    }
    async createCategory(dto, userRole) {
        if (userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can create categories');
        }
        const slug = this.generateSlug(dto.name);
        const existingCategory = await this.categoryRepository.findBySlug(slug);
        if (existingCategory) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        if (dto.parentId) {
            const parent = await this.categoryRepository.findById(dto.parentId);
            if (!parent || parent.deletedAt) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        if (dto.imageId) {
            const imageExists = await this.validateImageExists(dto.imageId);
            if (!imageExists) {
                throw new common_1.NotFoundException('Image not found');
            }
        }
        const maxOrder = await this.getMaxOrder(dto.parentId);
        const order = dto.order ?? maxOrder + 1;
        const category = await this.categoryRepository.create({
            name: dto.name,
            slug,
            description: dto.description,
            image: dto.imageId
                ? {
                    connect: { id: dto.imageId },
                }
                : undefined,
            parent: dto.parentId
                ? {
                    connect: { id: dto.parentId },
                }
                : undefined,
            isActive: dto.isActive ?? true,
            order,
        });
        return category_response_dto_1.CategoryResponseDto.fromEntity(category);
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, isActive, parentId, includeChildren = false, } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (parentId === null || parentId === 'null') {
            where.parentId = null;
        }
        else if (parentId) {
            where.parentId = parentId;
        }
        const [categories, total] = await Promise.all([
            this.categoryRepository.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
                include: {
                    image: true,
                    ...(includeChildren && {
                        children: {
                            where: { deletedAt: null },
                            include: {
                                image: true,
                            },
                            orderBy: { order: 'asc' },
                        },
                    }),
                },
            }),
            this.categoryRepository.count({ where }),
        ]);
        return {
            data: categories.map((category) => category_response_dto_1.CategoryResponseDto.fromEntity(category)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id, includeChildren = false) {
        let category;
        if (includeChildren) {
            category = await this.categoryRepository.findWithChildren(id);
        }
        else {
            category = await this.categoryRepository.findById(id);
        }
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (category.deletedAt) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category_response_dto_1.CategoryResponseDto.fromEntity(category);
    }
    async findChildren(parentId) {
        const parent = await this.categoryRepository.findById(parentId);
        if (!parent || parent.deletedAt) {
            throw new common_1.NotFoundException('Parent category not found');
        }
        const children = await this.categoryRepository.findChildren(parentId);
        return children.map((child) => category_response_dto_1.CategoryResponseDto.fromEntity(child));
    }
    async updateCategory(id, dto, userRole) {
        if (userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can update categories');
        }
        const category = await this.categoryRepository.findById(id);
        if (!category || category.deletedAt) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        const updateData = {};
        if (dto.name && dto.name !== category.name) {
            const slug = this.generateSlug(dto.name);
            const existingCategory = await this.categoryRepository.findBySlug(slug);
            if (existingCategory && existingCategory.id !== id) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
            updateData.slug = slug;
            updateData.name = dto.name;
        }
        if (dto.parentId !== undefined) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('Category cannot be its own parent');
            }
            if (dto.parentId) {
                const parent = await this.categoryRepository.findById(dto.parentId);
                if (!parent || parent.deletedAt) {
                    throw new common_1.NotFoundException('Parent category not found');
                }
                const isDescendant = await this.isDescendant(id, dto.parentId);
                if (isDescendant) {
                    throw new common_1.BadRequestException('Cannot set a descendant category as parent');
                }
                updateData.parent = { connect: { id: dto.parentId } };
            }
            else {
                updateData.parent = { disconnect: true };
            }
        }
        if (dto.imageId !== undefined) {
            if (dto.imageId && dto.imageId !== category.imageId) {
                const imageExists = await this.validateImageExists(dto.imageId);
                if (!imageExists) {
                    throw new common_1.NotFoundException('Image not found');
                }
                updateData.image = { connect: { id: dto.imageId } };
            }
            else if (!dto.imageId) {
                updateData.image = { disconnect: true };
            }
        }
        if (dto.description !== undefined) {
            updateData.description = dto.description;
        }
        if (dto.isActive !== undefined) {
            updateData.isActive = dto.isActive;
        }
        if (dto.order !== undefined) {
            updateData.order = dto.order;
        }
        const updatedCategory = await this.categoryRepository.update(id, updateData);
        return category_response_dto_1.CategoryResponseDto.fromEntity(updatedCategory);
    }
    async deleteCategory(id, userRole) {
        if (userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can delete categories');
        }
        const productCount = await this.prisma.product.count({
            where: {
                categoryId: id,
                deletedAt: null,
            },
        });
        if (productCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category with ${productCount} product(s). Please remove or reassign products first.`);
        }
        const category = await this.categoryRepository.findById(id);
        if (!category || category.deletedAt) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        const children = await this.categoryRepository.findChildren(id);
        if (children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with child categories. Please delete or move children first.');
        }
        await this.categoryRepository.softDelete(id);
    }
    generateSlug(name) {
        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        if (!baseSlug) {
            throw new common_1.BadRequestException('Category name must contain at least one alphanumeric character');
        }
        return baseSlug;
    }
    async getMaxOrder(parentId) {
        const where = {
            deletedAt: null,
        };
        if (parentId) {
            where.parentId = parentId;
        }
        else {
            where.parentId = null;
        }
        const categories = await this.categoryRepository.findMany({
            where,
            orderBy: { order: 'desc' },
            take: 1,
        });
        return categories.length > 0 ? categories[0].order : 0;
    }
    async isDescendant(categoryId, potentialParentId) {
        const MAX_DEPTH = 20;
        let currentId = categoryId;
        const visited = new Set();
        for (let i = 0; i < MAX_DEPTH; i++) {
            if (visited.has(currentId)) {
                throw new common_1.BadRequestException('Circular reference detected in category hierarchy');
            }
            visited.add(currentId);
            const category = await this.categoryRepository.findById(currentId);
            if (!category || !category.parentId) {
                return false;
            }
            if (category.parentId === potentialParentId) {
                return true;
            }
            currentId = category.parentId;
        }
        throw new common_1.BadRequestException(`Category hierarchy depth exceeds maximum of ${MAX_DEPTH} levels`);
    }
    async validateImageExists(imageId) {
        const file = await this.prisma.file.findUnique({
            where: { id: imageId },
        });
        return file !== null && file.deletedAt === null;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [category_repository_1.CategoryRepository,
        prisma_service_1.PrismaService])
], CategoryService);
//# sourceMappingURL=category.service.js.map