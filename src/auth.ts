import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminUser, createAdminUser, countAdminUsers } from "@/lib/turso-db";
import { verifyPassword, hashPassword } from "@/lib/password";

async function seedSuperAdmin() {
  // 确保超级管理员 gyp 始终存在于数据库
  try {
    const existing = await getAdminUser("gyp");
    if (!existing) {
      const hashed = await hashPassword("gyp2006");
      await createAdminUser({
        username: "gyp",
        password: hashed,
        name: "GY",
        role: "superadmin",
      });
    }
  } catch {
    // seed failed, not critical
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        // 确保超级管理员 gyp 始终存在
        try { await seedSuperAdmin(); } catch {}

        // 1. Try database lookup
        try {
          const dbUser = await getAdminUser(username);
          if (dbUser) {
            const valid = await verifyPassword(password, dbUser.password);
            if (valid) {
              const userRole = dbUser.role || "admin";
              return {
                id: dbUser.id,
                name: dbUser.name || dbUser.username,
                role: userRole,
              };
            }
            return null;
          }
        } catch {
          // DB query failed — fall through to env var
        }

        // 2. Fallback: env var credentials → superadmin
        const ADMIN_USER = process.env.ADMIN_USER || "admin";
        const ADMIN_PASS = process.env.ADMIN_PASS || "ashgolf2024";

        if (username === ADMIN_USER && password === ADMIN_PASS) {
          // Auto-seed env user as superadmin if DB is empty
          try {
            const count = await countAdminUsers();
            if (count === 0) {
              await seedSuperAdmin();
              const hashed = await hashPassword(ADMIN_PASS);
              const created = await createAdminUser({
                username: ADMIN_USER,
                password: hashed,
                name: "Admin",
                role: "superadmin",
              });
              return {
                id: created.id,
                name: created.name || ADMIN_USER,
                role: "superadmin",
              };
            }
          } catch {
            // seeding failed, return env-based user
          }
          return { id: "admin-env", name: "Admin", role: "superadmin" };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role || "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "admin";
      }
      return session;
    },
  },
  logger: {
    error(error) {
      console.error("[Auth Error]", error.message || error);
    },
  },
});
