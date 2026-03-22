import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DIRECT_URL or DATABASE_URL');
}

async function check() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    const count = await prisma.user.count();
    console.log('USER_COUNT_DIRECT:' + count);
  } catch (error) {
    console.error('Direct Check Error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

check();
