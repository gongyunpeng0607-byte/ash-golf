import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const t0 = Date.now();
  try {
    await db.$queryRaw`SELECT 1 as pong`;
    return NextResponse.json({ ok: true, ms: Date.now() - t0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: "db error", message: e.message, ms: Date.now() - t0 });
  }
}
