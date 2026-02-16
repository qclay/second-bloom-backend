import { Review } from '@prisma/client';

export class ReviewResponseDto {
  id!: string;
  reviewerId!: string;
  revieweeId!: string;
  productId!: string | null;
  orderId!: string | null;
  parentId!: string | null;
  rating!: number;
  comment!: string | null;
  isVerified!: boolean;
  isReported!: boolean;
  reportReason!: string | null;
  reportedAt!: Date | null;
  helpfulCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
  reviewer?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    avatarId: string | null;
  };
  reviewee?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };
  product?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  replies?: ReviewResponseDto[];
  parent?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;

  static fromEntity(
    review: Review & {
      reviewer?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
        avatarId: string | null;
      };
      reviewee?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
      product?: {
        id: string;
        title: unknown;
        slug: string;
      } | null;
      parent?: {
        id: string;
        rating: number;
        comment: string | null;
      } | null;
      replies?: Array<
        Review & {
          reviewer?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
            avatarId: string | null;
          };
        }
      >;
    },
  ): ReviewResponseDto {
    return {
      id: review.id,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      productId: review.productId,
      orderId: review.orderId,
      parentId: review.parentId,
      rating: review.rating,
      comment: review.comment,
      isVerified: review.isVerified,
      isReported: review.isReported,
      reportReason: review.reportReason,
      reportedAt: review.reportedAt,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      reviewer: review.reviewer
        ? {
            id: review.reviewer.id,
            firstName: review.reviewer.firstName,
            lastName: review.reviewer.lastName,
            phoneNumber: review.reviewer.phoneNumber,
            avatarId: review.reviewer.avatarId,
          }
        : undefined,
      reviewee: review.reviewee
        ? {
            id: review.reviewee.id,
            firstName: review.reviewee.firstName,
            lastName: review.reviewee.lastName,
            phoneNumber: review.reviewee.phoneNumber,
          }
        : undefined,
      product: review.product
        ? {
            id: review.product.id,
            title: (review.product.title as string) ?? '',
            slug: review.product.slug,
          }
        : null,
      replies: review.replies?.map((reply) =>
        ReviewResponseDto.fromEntity(reply),
      ),
      parent: review.parent
        ? {
            id: review.parent.id,
            rating: review.parent.rating,
            comment: review.parent.comment,
          }
        : null,
    };
  }
}
