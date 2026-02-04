import { Review, Prisma } from '@prisma/client';

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  create(data: Prisma.ReviewCreateInput): Promise<Review>;
  update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review>;
  delete(id: string): Promise<Review>;
  findMany(args: Prisma.ReviewFindManyArgs): Promise<Review[]>;
  count(args: Prisma.ReviewCountArgs): Promise<number>;
  findReplies(parentId: string): Promise<Review[]>;
}
