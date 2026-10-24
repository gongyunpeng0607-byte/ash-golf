import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "healthy",
      checks: { db: { ok: true, latencyMs: Date.now() - start } },
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return Response.json(
      {
        status: "unhealthy",
        checks: { db: { ok: false, error: e.message, latencyMs: Date.now() - start } },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
