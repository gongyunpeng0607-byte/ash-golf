import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateAdminUserPassword, deleteAdminUser } from "@/lib/turso-db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

// PUT — update password (superadmin only, or own password)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentUserId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // 普通 admin 只能改自己密码，superadmin 可以改任何人
  if (userRole !== "superadmin" && id !== currentUserId) {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "密碼至少需要 6 個字元" },
        { status: 400 },
      );
    }

    const hashed = await hashPassword(password);
    await updateAdminUserPassword(id, hashed);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — remove user (superadmin only, can't delete yourself)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const currentUserId = (session.user as any).id;
  const userRole = (session.user as any).role;

  if (userRole !== "superadmin") {
    return NextResponse.json({ error: "權限不足" }, { status: 403 });
  }

  if (id === currentUserId) {
    return NextResponse.json(
      { error: "無法刪除自己的帳號" },
      { status: 400 },
    );
  }

  // 不允许删除其他 superadmin
  try {
    await deleteAdminUser(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
