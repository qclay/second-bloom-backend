import { File, Prisma } from '@prisma/client';

export interface IFileRepository {
  create(data: Prisma.FileCreateInput): Promise<File>;
}
