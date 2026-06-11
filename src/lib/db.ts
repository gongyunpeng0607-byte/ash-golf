import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function makePrisma() {
  const url = process.env.DATABASE_URL || "file:./dev.db";

  // Turso 云数据库
  if (url.startsWith("libsql://")) {
    try {
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      const { createClient } = require("@libsql/client");
      const authToken = process.env.TURSO_AUTH_TOKEN;
      if (!authToken) throw new Error("TURSO_AUTH_TOKEN not set");
      const libsql = createClient({ url, authToken });
      return new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
    } catch {
      // fallback to local SQLite if adapter fails
      return new PrismaClient();
    }
  }

  // 本地 SQLite
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
