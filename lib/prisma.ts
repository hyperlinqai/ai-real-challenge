import { PrismaClient } from "@/lib/generated/prisma/client";
import { getDatabaseConnectionString, getPrismaPgAdapter } from "@/lib/db/postgres";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: getPrismaPgAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    getDatabaseConnectionString();
  } catch {
    return false;
  }
  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
