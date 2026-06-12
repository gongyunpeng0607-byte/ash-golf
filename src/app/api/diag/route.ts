import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    return NextResponse.json({ ok: false, reason: "missing env vars", url: !!url, token: !!token });
  }

  const t0 = Date.now();
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${url}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT 1 as pong" } }] }),
      signal: controller.signal,
    });
    const ms = Date.now() - t0;
    const data = await res.json();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      ms,
      results: data.results?.map((r: any) => r.type),
      error: data.results?.[0]?.error?.message || null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: "fetch error", message: e.message, ms: Date.now() - t0 });
  }
}
