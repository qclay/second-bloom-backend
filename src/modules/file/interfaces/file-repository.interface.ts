import { File, Prisma } from '@prisma/client';

export interface IFileRepository {
  findById(id: string): Promise<File | null>;
  findByKey(key: string): Promise<File | null>;
  findByUrl(url: string): Promise<File | null>;
  create(data: Prisma.FileCreateInput): Promise<File>;
  update(id: string, data: Prisma.FileUpdateInput): Promise<File>;
  softDelete(id: string, deletedBy: string): Promise<File>;
  findMany(args: Prisma.FileFindManyArgs): Promise<File[]>;
  count(args: Prisma.FileCountArgs): Promise<number>;
}
