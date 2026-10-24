import type { NextAuthConfig } from "next-auth";

/**
 * 与数据库无关的 NextAuth 配置（Edge 兼容）。
 * middleware 只做 JWT 会话校验，不能引入 Prisma / Node 内置模块，
 * 因此把不依赖数据库的部分单独拆到这里，供 middleware 与 auth.ts 共用。
 */
export const authConfig: NextAuthConfig = {
  providers: [],
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
};
