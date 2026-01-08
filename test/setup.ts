import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'test' ? [] : ['error', 'warn'],
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  const deleteOrder = prisma.order.deleteMany();
  const deletePayment = prisma.payment.deleteMany();
  const deleteBid = prisma.bid.deleteMany();
  const deleteAuction = prisma.auction.deleteMany();
  const deleteReview = prisma.review.deleteMany();
  const deleteNotification = prisma.notification.deleteMany();
  const deleteProductImage = prisma.productImage.deleteMany();
  const deleteProduct = prisma.product.deleteMany();
  const deleteFile = prisma.file.deleteMany();
  const deleteCategory = prisma.category.deleteMany();
  const deleteVerificationCode = prisma.verificationCode.deleteMany();
  const deleteUser = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteOrder,
    deletePayment,
    deleteBid,
    deleteAuction,
    deleteReview,
    deleteNotification,
    deleteProductImage,
    deleteProduct,
    deleteFile,
    deleteCategory,
    deleteVerificationCode,
    deleteUser,
  ]);
});
