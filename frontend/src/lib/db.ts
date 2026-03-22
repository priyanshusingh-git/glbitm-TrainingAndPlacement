import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function getPrismaClientOptions(): ConstructorParameters<typeof PrismaClient>[0] {
  const accelerateUrl = process.env.DATABASE_URL

  if (accelerateUrl?.startsWith("prisma://")) {
    return { accelerateUrl }
  }

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("Prisma connection string is not configured.")
  }

  return {
    adapter: new PrismaPg({ connectionString }),
  }
}

const prismaClientSingleton = () =>
  new PrismaClient(getPrismaClientOptions())

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Use a Proxy for lazy initialization to prevent build-time PrismaClientInitializationError
// during Next.js static analysis/page data collection.
const prisma = new Proxy({} as PrismaClientSingleton, {
  get(target, prop, receiver) {
    // Skip proxy for internal symbols or if we're just checking for existence
    if (typeof prop === 'symbol' || prop === 'toJSON' || prop === 'then') {
      return Reflect.get(target, prop, receiver);
    }
    
    // Initialize the real client if it hasn't been yet
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton();
    }
    
    const value = Reflect.get(globalForPrisma.prisma, prop);
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value;
  }
});

export default prisma
