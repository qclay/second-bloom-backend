/**
 * Removes the migration record for 20260127021320_remove_last_login_at
 * so Prisma can re-apply it and store the correct checksum (fixes "modified after applied").
 *
 * Run: npm run prisma:fix-checksum
 * Then: npx prisma migrate dev
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.$executeRawUnsafe(
    `DELETE FROM "_prisma_migrations" WHERE migration_name = '20260127021320_remove_last_login_at'`,
  );
  console.log(
    `Removed ${result} row(s) for migration: 20260127021320_remove_last_login_at`,
  );
  console.log('Now run: npx prisma migrate dev');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
