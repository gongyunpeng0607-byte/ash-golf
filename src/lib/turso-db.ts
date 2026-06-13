/* eslint-disable */

const TURSO_URL = process.env.TURSO_DB_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";
const isLocalDev = process.env.NODE_ENV !== "production" && (!TURSO_URL || !TURSO_TOKEN);

// === RAM Cache Layer — Vercel instance 内存，Turso query 结果缓存 N 秒 ===
const CACHE = new Map<string, { data: any; expire: number }>();
const CACHE_TTL = 5000; // 前台 5 秒，后台用 0

function gcache<T>(key: string, ttl: number): T | null {
  const entry = CACHE.get(key);
  if (entry && Date.now() < entry.expire) return entry.data as T;
  CACHE.delete(key);
  return null;
}

function scache(key: string, data: any, ttl: number) {
  CACHE.set(key, { data, expire: Date.now() + ttl });
}

// === Turso HTTP with retry ===
async function retryFetch(u: string, opts: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const ctl = new AbortController();
      const tm = setTimeout(() => ctl.abort(), 8000);
      const res = await fetch(u, { ...opts, signal: ctl.signal });
      clearTimeout(tm);
      if (res.ok) return res;
    } catch {
      if (i === retries - 1) throw new Error("Turso unreachable");
      await new Promise(r => setTimeout(r, 200 * (i + 1)));
    }
  }
  throw new Error("Turso failed");
}

async function exec(stmts: string[]) {
  const res = await retryFetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts.map((sql: string) => ({ type: "execute", stmt: { sql } })) }),
  });
  return (await res.json()).results;
}

async function query(sql: string): Promise<any[]> {
  const results = await exec([sql]);
  const r = results[0];
  if (r.type !== "ok") return [];
  const cols: string[] = r.response.result.cols.map((c: any) => c.name);
  return r.response.result.rows.map((row: any[]) => {
    const obj: any = {};
    cols.forEach((col, i) => {
      const cell = row[i];
      obj[col] = cell.type === "integer" ? (cell.value ? Number(cell.value) : 0) : cell.value;
    });
    return obj;
  });
}

// === Cache wrapper — 5s TTL for frontend, 0 for admin ===
async function cachedQuery(sql: string, ttl: number): Promise<any[]> {
  const key = `q:${sql}`;
  const hit = gcache<any[]>(key, ttl);
  if (hit) return hit;

  // local dev
  if (isLocalDev) {
    const result = await localQuery(sql);
    scache(key, result, ttl);
    return result;
  }

  const result = ttl > 0
    ? await query(sql).catch(() => [] as any[])
    : await query(sql);

  if (result.length > 0 || ttl > 0) scache(key, result, ttl);
  return result;
}

async function localQuery(sql: string): Promise<any[]> {
  const { db } = await import("./db");
  if (sql.includes("count(*)") && sql.includes("Product")) {
    const c = await db.product.count({ where: { isActive: true } });
    return [{ total: c }];
  }
  if (sql.includes("slug =")) {
    const m = sql.match(/slug\s*=\s*'([^']+)'/);
    if (m) { const p = await db.product.findUnique({ where: { slug: m[1] }, include: { category: true } }); return p ? [{ ...p, categoryName: p.category?.name, categorySlug: p.category?.slug }] : []; }
  }
  if (sql.includes("id =")) {
    const m = sql.match(/id\s*=\s*'([^']+)'/);
    if (m) { const p = await db.product.findUnique({ where: { id: m[1] } }); return p ? [p] : []; }
  }
  if (sql.includes("SELECT * FROM Product")) {
    const products = await db.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, include: { category: true }, take: 50 });
    return products.map(p => ({ ...p, categoryName: p.category?.name, categorySlug: p.category?.slug }));
  }
  if (sql.includes("SELECT * FROM Category")) return db.category.findMany();
  if (sql.includes('"Order"')) {
    return db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }).then((rows) => rows as unknown as any[]);
  }
  return [];
}

// ============ Exports ============
export async function getProducts(opts: { where?: string; orderBy?: string; skip?: number; take?: number; ttl?: number }): Promise<any> {
  const { where = "isActive = 1", orderBy = "createdAt DESC", skip = 0, take = 24, ttl = 5000 } = opts;
  const [rows, counts] = await Promise.all([
    cachedQuery(`SELECT * FROM Product WHERE ${where} ORDER BY ${orderBy} LIMIT ${take} OFFSET ${skip}`, ttl),
    cachedQuery(`SELECT count(*) as total FROM Product WHERE ${where}`, ttl),
  ]);
  return { products: rows, total: Number(counts[0]?.total || 0) };
}

export async function getProductBySlug(slug: string): Promise<any> {
  const rows = await cachedQuery(
    `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug = '${slug.replace(/'/g,"''")}'`,
    5000
  );
  if (!rows[0]) return null;
  return { ...rows[0], category: { name: rows[0].categoryName, slug: rows[0].categorySlug } };
}

export async function getProductById(id: string): Promise<any> {
  const rows = await cachedQuery(`SELECT * FROM Product WHERE id = '${id}'`, 0); // admin: no cache
  return rows[0] || null;
}

export async function getCategories(): Promise<any[]> {
  return cachedQuery("SELECT * FROM Category ORDER BY name", 30000); // 30s cache
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  const q = `SELECT * FROM Category WHERE slug = '${slug.replace(/'/g,"''")}'`;
  const rows = await cachedQuery(q, 5000);
  if (!rows[0]) return null;
  const cat = rows[0];
  const p = await getProducts({ where: `isActive = 1 AND categoryId = '${cat.id}'`, orderBy: "createdAt DESC", take: 50, ttl: 5000 });
  return { ...cat, products: p.products };
}

export async function getOrders(page = 1, pageSize = 20): Promise<any> {
  const ttl = 0; // admin: no cache
  const [rows, cnt] = await Promise.all([
    cachedQuery(`SELECT * FROM "Order" ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`, ttl),
    cachedQuery('SELECT count(*) as total FROM "Order"', ttl),
  ]);
  return { orders: rows, total: Number(cnt[0]?.total || 0) };
}

export async function getOrderById(id: string): Promise<any> {
  const rows = await cachedQuery(`SELECT * FROM "Order" WHERE id = '${id}'`, 0);
  if (!rows[0]) return null;
  const items = await cachedQuery(
    `SELECT oi.*, p.name as productName, p.slug as productSlug FROM OrderItem oi JOIN Product p ON oi.productId = p.id WHERE oi.orderId = '${id}'`,
    0
  );
  return { ...rows[0], items: items.map((i: any) => ({ ...i, product: { name: i.productName, slug: i.productSlug } })) };
}

// 清除所有缓存
export function clearCache() { CACHE.clear(); }
