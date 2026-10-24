import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// 单例：本地 SQLite 与 Turso 云共用同一套 Prisma，仅靠 env 切换连接目标
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // 生产（Vercel）：TURSO_DB_URL + TURSO_AUTH_TOKEN 已设 → 直连 Turso
  // 本地开发：未设 Turso → 落到 DATABASE_URL=file:./dev.db
  const url = process.env.TURSO_DB_URL || process.env.DATABASE_URL || "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
