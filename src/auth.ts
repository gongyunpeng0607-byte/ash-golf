import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminUser, createAdminUser, countAdminUsers } from "@/lib/turso-db";
import { verifyPassword, hashPassword } from "@/lib/password";

async function seedSuperAdmin() {
  try {
    const existing = await getAdminUser("gyp");
    if (!existing) {
      const hashed = await hashPassword("gyp2006");
      await createAdminUser({
        username: "gyp",
        password: hashed,
        name: "GY",
        role: "superadmin",
        permissions: ["products", "orders", "users"],
      });
    }
  } catch {}
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

        try { await seedSuperAdmin(); } catch {}

        // 1. Database lookup
        try {
          const dbUser = await getAdminUser(username);
          if (dbUser) {
            const valid = await verifyPassword(password, dbUser.password);
            if (valid) {
              const perms = typeof dbUser.permissions === "string"
                ? JSON.parse(dbUser.permissions || "[]")
                : (dbUser.permissions || []);
              return {
                id: dbUser.id,
                name: dbUser.name || dbUser.username,
                role: dbUser.role || "admin",
                permissions: perms,
              };
            }
            return null;
          }
        } catch {}

        // 2. Fallback: env var
        const ADMIN_USER = process.env.ADMIN_USER || "admin";
        const ADMIN_PASS = process.env.ADMIN_PASS || "ashgolf2024";

        if (username === ADMIN_USER && password === ADMIN_PASS) {
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
                permissions: ["products", "orders", "users"],
              });
              return {
                id: created.id,
                name: created.name || ADMIN_USER,
                role: "superadmin",
                permissions: ["products", "orders", "users"],
              };
            }
          } catch {}
          return {
            id: "admin-env", name: "Admin", role: "superadmin",
            permissions: ["products", "orders", "users"],
          };
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
        token.permissions = (user as any).permissions || [];
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "admin";
        (session.user as any).permissions = token.permissions || [];
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
