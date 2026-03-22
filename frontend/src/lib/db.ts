import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const prismaClientSingleton = () => {
  // During Next.js build, DATABASE_URL may be missing. 
  // Providing a fallback URL prevents "PrismaClientInitializationError" during static analysis.
  const url = process.env.DATABASE_URL || "prisma://accelerate.prisma-data.net/?api_key=placeholder"
  
  return new PrismaClient({
    datasourceUrl: url,
  }).$extends(withAccelerate())
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma