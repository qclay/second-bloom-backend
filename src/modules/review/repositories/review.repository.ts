import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IReviewRepository } from '../interfaces/review-repository.interface';
import { Review, Prisma } from '@prisma/client';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  async findMany(args: Prisma.ReviewFindManyArgs): Promise<Review[]> {
    return this.prisma.review.findMany(args);
  }

  async count(args: Prisma.ReviewCountArgs): Promise<number> {
    return this.prisma.review.count(args);
  }

  async findReplies(parentId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async incrementHelpfulCount(id: string): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });
  }
}
