export const dynamic = "force-dynamic";

interface HealthResult {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    turso: { ok: boolean; latencyMs: number; error?: string };
    cache: { size: number };
  };
  timestamp: string;
}

export async function GET() {
  const result: HealthResult = {
    status: "healthy",
    checks: {
      turso: { ok: false, latencyMs: 0 },
      cache: { size: 0 },
    },
    timestamp: new Date().toISOString(),
  };

  // Turso connectivity check
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    result.checks.turso = { ok: false, latencyMs: 0, error: "missing env vars" };
    result.status = "unhealthy";
    return Response.json(result, { status: 503 });
  }

  try {
    const start = Date.now();
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch(`${url}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT 1" } }] }),
      signal: ctl.signal,
    });
    clearTimeout(tm);
    result.checks.turso.latencyMs = Date.now() - start;

    const data = await res.json();
    result.checks.turso.ok = data.results?.[0]?.type === "ok";
    if (!result.checks.turso.ok) {
      result.checks.turso.error = "query returned non-ok";
      result.status = "degraded";
    }
  } catch (e: any) {
    result.checks.turso.latencyMs = Date.now() - (Date.now() - result.checks.turso.latencyMs);
    result.checks.turso.error = e.message;
    result.status = "degraded";
  }

  // Aggregated status
  if (!result.checks.turso.ok) {
    result.status = result.status === "degraded" ? "degraded" : "unhealthy";
  }

  const statusCode = result.status === "healthy" ? 200 : result.status === "degraded" ? 200 : 503;

  return Response.json(result, { status: statusCode });
}
