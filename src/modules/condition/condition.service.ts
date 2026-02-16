import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateConditionDto } from './dto/create-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { ConditionQueryDto } from './dto/condition-query.dto';
import { ConditionResponseDto } from './dto/condition-response.dto';
import { atLeastOneTranslation } from '../../common/dto/translation.dto';
import { getTranslationForSlug } from '../../common/i18n/translation.util';
import { Prisma } from '@prisma/client';
import { TranslationService } from '../translation/translation.service';

@Injectable()
export class ConditionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

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
      const existing = await this.prisma.condition.findFirst({
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

  async create(
    dto: CreateConditionDto,
    userId: string,
  ): Promise<ConditionResponseDto> {
    if (!atLeastOneTranslation(dto.name)) {
      throw new BadRequestException(
        'Condition name must have at least one translation (en, ru, or uz)',
      );
    }

    dto.name = await this.translationService.autoCompleteTranslations(dto.name);

    const nameForSlug = getTranslationForSlug(
      dto.name as Record<string, string>,
    );
    const baseSlug = this.slugify(nameForSlug);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const existing = await this.prisma.condition.findFirst({
      where: { slug, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Condition with this name already exists');
    }

    const condition = await this.prisma.condition.create({
      data: {
        name: dto.name as unknown as Prisma.InputJsonValue,
        slug,
        createdById: userId,
      },
    });
    return ConditionResponseDto.fromEntity(condition);
  }

  async findAll(query: ConditionQueryDto) {
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
      this.prisma.condition.findMany({
        where,
        orderBy: { slug: 'asc' },
        skip,
        take: limit,
        include: { createdBy: { select: { id: true, role: true } } },
      }),
      this.prisma.condition.count({ where }),
    ]);

    return {
      data: items.map((c) => ConditionResponseDto.fromEntity(c)),
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

  async findById(id: string): Promise<ConditionResponseDto> {
    const condition = await this.prisma.condition.findFirst({
      where: { id, deletedAt: null },
    });
    if (!condition) {
      throw new NotFoundException('Condition not found');
    }
    return ConditionResponseDto.fromEntity(condition);
  }

  async update(
    id: string,
    dto: UpdateConditionDto,
    userId: string,
    role: UserRole,
  ): Promise<ConditionResponseDto> {
    const condition = await this.prisma.condition.findFirst({
      where: { id, deletedAt: null },
    });
    if (!condition) {
      throw new NotFoundException('Condition not found');
    }
    if (role !== UserRole.ADMIN && condition.createdById !== userId) {
      throw new ForbiddenException('You can only update your own condition');
    }

    let slug: string | undefined;
    if (dto.name !== undefined && atLeastOneTranslation(dto.name)) {
      dto.name = await this.translationService.autoCompleteTranslations(
        dto.name,
      );
      const nameForSlug = getTranslationForSlug(
        dto.name as Record<string, string>,
      );
      const baseSlug = this.slugify(nameForSlug);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const updated = await this.prisma.condition.update({
      where: { id },
      data: {
        ...(dto.name !== undefined &&
          atLeastOneTranslation(dto.name) && {
            name: dto.name as unknown as Prisma.InputJsonValue,
          }),
        ...(slug !== undefined && { slug }),
      },
    });
    return ConditionResponseDto.fromEntity(updated);
  }

  async remove(id: string, userId: string, role: UserRole): Promise<void> {
    const condition = await this.prisma.condition.findFirst({
      where: { id, deletedAt: null },
    });
    if (!condition) {
      throw new NotFoundException('Condition not found');
    }
    if (role !== UserRole.ADMIN && condition.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own condition');
    }

    await this.prisma.condition.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
