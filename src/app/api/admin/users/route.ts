import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listAdminUsers, createAdminUser } from "@/lib/turso-db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

// GET — list all admin users (any logged-in admin can view)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create new admin user (superadmin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "superadmin") {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "帳號和密碼為必填" },
        { status: 400 },
      );
    }

    if (username.length < 2) {
      return NextResponse.json(
        { error: "帳號至少需要 2 個字元" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密碼至少需要 6 個字元" },
        { status: 400 },
      );
    }

    const hashed = await hashPassword(password);
    const user = await createAdminUser({
      username: username.trim(),
      password: hashed,
      name: name?.trim() || undefined,
      role: "admin",
    });

    return NextResponse.json(
      { user: { id: user.id, username: user.username, name: user.name, role: user.role } },
      { status: 201 },
    );
  } catch (e: any) {
    if (e.message?.includes("unique") || e.message?.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "此帳號已被使用" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
