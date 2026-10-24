import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge 运行时无法加载 Prisma，因此 middleware 只依赖无数据库的 authConfig 做 JWT 校验
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  if (isAdmin && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
