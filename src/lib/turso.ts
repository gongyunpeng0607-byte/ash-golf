/**
 * Turso 云数据库 HTTP API 客户端
 * 避免 Native 模块在 Vercel 构建时的兼容性问题
 */

const TURSO_URL = process.env.TURSO_DB_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

async function exec(stmts: string[]) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts.map(sql => ({ type: "execute", stmt: { sql } })) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.results;
}

export async function tursoQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const results = await exec([sql]);
  const result = results[0];
  if (result.type !== "ok" || result.response.type !== "execute") return [];
  const cols = result.response.result.cols.map((c: { name: string }) => c.name);
  const rows = result.response.result.rows as Array<Array<{ type: string; value: string | null }>>;
  return rows.map(row => {
    const obj: Record<string, unknown> = {};
    row.forEach((cell, i) => {
      obj[cols[i]] = cell.type === "integer" ? parseInt(cell.value ?? "0") : cell.value;
    });
    return obj as T;
  });
}

export async function tursoExecute(sql: string): Promise<void> {
  await exec([sql]);
}

export function isTurso(): boolean {
  return !!(TURSO_URL && TURSO_TOKEN);
}
