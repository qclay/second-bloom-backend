import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IFileRepository } from '../interfaces/file-repository.interface';
import { File, Prisma } from '@prisma/client';

@Injectable()
export class FileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.FileCreateInput): Promise<File> {
    return this.prisma.file.create({
      data,
    });
  }
}
