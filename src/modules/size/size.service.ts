import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizeQueryDto } from './dto/size-query.dto';
import { SizeResponseDto } from './dto/size-response.dto';

@Injectable()
export class SizeService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let n = 0;
    while (true) {
      const existing = await this.prisma.size.findFirst({
        where: {
          slug,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      if (!existing) return slug;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }
  }

  async create(dto: CreateSizeDto, userId: string): Promise<SizeResponseDto> {
    const baseSlug = this.slugify(dto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const existing = await this.prisma.size.findFirst({
      where: { slug, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Size with this name already exists');
    }

    const size = await this.prisma.size.create({
      data: {
        name: dto.name,
        slug,
        createdById: userId,
      },
    });
    return SizeResponseDto.fromEntity(size);
  }

  async findAll(query: SizeQueryDto) {
    const { page = 1, limit = 100, adminOnly = false } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      isActive: true,
      ...(adminOnly
        ? {
            createdBy: {
              role: UserRole.ADMIN,
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.size.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: { createdBy: { select: { id: true, role: true } } },
      }),
      this.prisma.size.count({ where }),
    ]);

    return {
      data: items.map((s) => SizeResponseDto.fromEntity(s)),
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findById(id: string): Promise<SizeResponseDto> {
    const size = await this.prisma.size.findFirst({
      where: { id, deletedAt: null },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    return SizeResponseDto.fromEntity(size);
  }

  async update(
    id: string,
    dto: UpdateSizeDto,
    userId: string,
    role: UserRole,
  ): Promise<SizeResponseDto> {
    const size = await this.prisma.size.findFirst({
      where: { id, deletedAt: null },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    if (role !== UserRole.ADMIN && size.createdById !== userId) {
      throw new ForbiddenException('You can only update your own size');
    }

    let slug: string | undefined;
    if (dto.name !== undefined) {
      const baseSlug = this.slugify(dto.name);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const updated = await this.prisma.size.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(slug !== undefined && { slug }),
      },
    });
    return SizeResponseDto.fromEntity(updated);
  }

  async remove(id: string, userId: string, role: UserRole): Promise<void> {
    const size = await this.prisma.size.findFirst({
      where: { id, deletedAt: null },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    if (role !== UserRole.ADMIN && size.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own size');
    }

    await this.prisma.size.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
