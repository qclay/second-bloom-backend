
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const product = await prisma.product.findFirst({
    where: { slug: 'red-roses-bouquet' },
    select: { id: true, sellerId: true }
  });

  if (!product) {
    console.log('Product not found');
    return;
  }

  console.log('Testing product:', product.id, 'Seller:', product.sellerId);

  const messages = await prisma.message.findMany({
    where: {
      senderId: { not: product.sellerId },
      isDeleted: false,
      deletedAt: null,
      conversation: {
        productId: product.id,
        deletedAt: null,
        isActive: true,
        participants: {
          some: {
            userId: product.sellerId,
          },
        },
      },
    },
    include: {
        sender: true,
        conversation: true
    }
  });

  console.log('Found messages:', messages.length);
  messages.forEach(m => {
      console.log(`- From: ${m.sender.firstName} (${m.senderId}), Conv: ${m.conversationId}`);
  });

  await prisma.$disconnect();
}

test();
