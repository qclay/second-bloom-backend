import { PrismaClient, UserRole } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'test' ? [] : ['error', 'warn'],
});

export async function createTestUser(data?: {
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}) {
  const phoneNumber =
    data?.phoneNumber || `+998${Math.floor(Math.random() * 1000000000)}`;
  return prisma.user.create({
    data: {
      phoneNumber,
      firstName: data?.firstName || 'Test',
      lastName: data?.lastName || 'User',
      role: data?.role || UserRole.USER,
      isActive: true,
    },
  });
}

export async function createTestCategory(data?: {
  name?: string;
  slug?: string;
  parentId?: string;
}) {
  return prisma.category.create({
    data: {
      name: data?.name || 'Test Category',
      slug: data?.slug || `test-category-${Date.now()}`,
      description: 'Test category description',
      isActive: true,
      parentId: data?.parentId,
    },
  });
}

export async function createTestProduct(data?: {
  title?: string;
  sellerId?: string;
  categoryId?: string;
  price?: number;
}) {
  const seller = data?.sellerId
    ? await prisma.user.findUnique({ where: { id: data.sellerId } })
    : await createTestUser();

  if (!seller) {
    throw new Error('Failed to create test seller');
  }

  const category = data?.categoryId
    ? await prisma.category.findUnique({ where: { id: data.categoryId } })
    : await createTestCategory();

  if (!category) {
    throw new Error('Failed to create test category');
  }

  return prisma.product.create({
    data: {
      title: data?.title || 'Test Product',
      slug: `test-product-${Date.now()}`,
      description: 'Test product description',
      price: data?.price || 100000,
      currency: 'UZS',
      type: 'FRESH',
      condition: 'EXCELLENT',
      quantity: 1,
      region: 'Tashkent',
      city: 'Tashkent',
      sellerId: seller.id,
      categoryId: category.id,
    },
  });
}

export async function createTestVerificationCode(
  phoneNumber: string,
  code?: string,
) {
  return prisma.verificationCode.create({
    data: {
      phoneNumber,
      code: code || '123456',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isUsed: false,
    },
  });
}

export async function cleanupTestData() {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.bid.deleteMany(),
    prisma.auction.deleteMany(),
    prisma.review.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.file.deleteMany(),
    prisma.category.deleteMany(),
    prisma.verificationCode.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
