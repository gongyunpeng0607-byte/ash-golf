import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "帳號", type: "text" },
        password: { label: "密碼", type: "password" },
      },
      authorize: async (credentials) => {
        // 优先读环境变量，未设定则用默认值
        const ADMIN_USER = process.env.ADMIN_USER || "admin";
        const ADMIN_PASS = process.env.ADMIN_PASS || "ashgolf2024";

        const u = String(credentials?.username ?? "").trim();
        const p = String(credentials?.password ?? "");

        if (u === ADMIN_USER && p === ADMIN_PASS) {
          return { id: "admin-1", name: "Admin" };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
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
