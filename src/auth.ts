import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { getAdminUser, createAdminUser, countAdminUsers, parsePermissions } from "@/lib/data";
import { verifyPassword, hashPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "帳號", type: "text" },
        password: { label: "密碼", type: "password" },
      },
      authorize: async (credentials) => {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!username || !password) return null;

        // 1. 数据库用户验证
        const dbUser = await getAdminUser(username);
        if (dbUser) {
          const valid = await verifyPassword(password, dbUser.password);
          if (!valid) return null;
          return {
            id: dbUser.id,
            name: dbUser.name || dbUser.username,
            role: dbUser.role || "admin",
            permissions: parsePermissions(dbUser.permissions),
          };
        }

        // 2. 首次启动引导：仅在显式配置 ADMIN_USER / ADMIN_PASS 且数据库为空时可用
        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASS;
        if (adminUser && adminPass && username === adminUser && password === adminPass) {
          const count = await countAdminUsers();
          if (count === 0) {
            const hashed = await hashPassword(adminPass);
            const created = await createAdminUser({
              username: adminUser,
              password: hashed,
              name: "Admin",
              role: "superadmin",
              permissions: ["products", "orders", "users"],
            });
            return {
              id: created.id,
              name: created.name || adminUser,
              role: "superadmin",
              permissions: ["products", "orders", "users"],
            };
          }
        }

        return null;
      },
    }),
  ],
});
