import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminUser, createAdminUser, countAdminUsers } from "@/lib/turso-db";
import { verifyPassword, hashPassword } from "@/lib/password";

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

        // 1. Try database lookup
        try {
          const dbUser = await getAdminUser(username);
          if (dbUser) {
            const valid = await verifyPassword(password, dbUser.password);
            if (valid) {
              return { id: dbUser.id, name: dbUser.name || dbUser.username };
            }
            return null;
          }
        } catch {
          // DB query failed — fall through to env var
        }

        // 2. Fallback: env var credentials
        const ADMIN_USER = process.env.ADMIN_USER || "admin";
        const ADMIN_PASS = process.env.ADMIN_PASS || "ashgolf2024";

        if (username === ADMIN_USER && password === ADMIN_PASS) {
          // Auto-seed: create this user in DB if table is empty
          try {
            const count = await countAdminUsers();
            if (count === 0) {
              const hashed = await hashPassword(ADMIN_PASS);
              const created = await createAdminUser({
                username: ADMIN_USER,
                password: hashed,
                name: "Admin",
              });
              return { id: created.id, name: created.name || ADMIN_USER };
            }
          } catch {
            // seeding failed, return env-based user
          }
          return { id: "admin-env", name: "Admin" };
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
        token.role = "admin";
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
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
