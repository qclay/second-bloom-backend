import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.log('Need at least 2 users');
    return;
  }
  const u1 = users[0].id;
  const u2 = users[1].id;

  // Block u2 from u1
  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId: u1, blockedId: u2 } },
    create: { blockerId: u1, blockedId: u2, isActive: true },
    update: { isActive: true },
  });
  console.log('Blocked u2 as u1');

  // Now emulate isUserBlockingOtherUser
  const block = await prisma.userBlock.findFirst({
    where: { isActive: true, blockerId: u1, blockedId: u2 },
    select: { id: true },
  });
  console.log({ block });
}

main().catch(console.error).finally(() => prisma.$disconnect());
