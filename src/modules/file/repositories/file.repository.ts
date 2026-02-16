import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IFileRepository } from '../interfaces/file-repository.interface';
import { File, Prisma } from '@prisma/client';

@Injectable()
export class FileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  async findByKey(key: string): Promise<File | null> {
    return this.prisma.file.findFirst({
      where: { key, deletedAt: null },
    });
  }

  async findByUrl(url: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { url },
    });
  }

  async create(data: Prisma.FileCreateInput): Promise<File> {
    return this.prisma.file.create({
      data,
    });
  }

  async update(id: string, data: Prisma.FileUpdateInput): Promise<File> {
    return this.prisma.file.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<File> {
    return this.prisma.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        isActive: false,
      },
    });
  }

  async findMany(args: Prisma.FileFindManyArgs): Promise<File[]> {
    return this.prisma.file.findMany(args);
  }

  async count(args: Prisma.FileCountArgs): Promise<number> {
    return this.prisma.file.count(args);
  }
}
