import { PrismaClient } from "@prisma/client";

// Pega a URL diretamente do ambiente do Node, sem intermediários
const directUrl = process.env.DATABASE_URL;

const createPrismaClient = () => {
  if (!directUrl) {
    throw new Error("ERRO CRÍTICO: DATABASE_URL não encontrada no process.env");
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: directUrl,
      },
    },
    log: ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Singleton para evitar múltiplas conexões em desenvolvimento
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;