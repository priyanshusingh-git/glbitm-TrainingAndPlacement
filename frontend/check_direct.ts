import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// For Prisma 7, the URL is read from prisma.config.ts by default.
// To override it for a direct connection in a script, we can set DATABASE_URL temporarily.
process.env.DATABASE_URL = process.env.DIRECT_URL;

async function check() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log('USER_COUNT_DIRECT:' + count);
  } catch (error) {
    console.error('Direct Check Error:', error);
  } finally {
    process.exit(0);
  }
}

check();
