import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 本地开发走 file:./dev.db；生产用 Turso 时改为 TURSO_DB_URL（libsql://）
    url: process.env.TURSO_DB_URL || process.env.DATABASE_URL || "file:./dev.db",
  },
});
