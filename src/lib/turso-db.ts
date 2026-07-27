/* eslint-disable */

const TURSO_URL = process.env.TURSO_DB_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";
const isLocalDev = process.env.NODE_ENV !== "production" && (!TURSO_URL || !TURSO_TOKEN);

// === 内存缓存层：Vercel 实例生命周期内有效，同一实例内的请求直接命中 ===
const CACHE = new Map<string, { data: any; expire: number }>();

function gcache<T>(key: string, ttl: number): { hit: boolean; data?: T } {
  const entry = CACHE.get(key);
  if (entry && Date.now() < entry.expire) return { hit: true, data: entry.data as T };
  CACHE.delete(key);
  return { hit: false };
}

function scache(key: string, data: any, ttl: number) {
  CACHE.set(key, { data, expire: Date.now() + ttl });
}

// === Turso HTTP (fast retry) ===
async function fetchTurso(stmts: any[]): Promise<any[]> {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts.map((sql: string) => ({ type: "execute", stmt: { sql } })) }),
  });
  return (await res.json()).results;
}

async function query(sql: string): Promise<any[]> {
  const results = await fetchTurso([sql]);
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

// 前台: 30s缓存  |  后台: 0s
async function cachedQuery(sql: string, ttl: number): Promise<any[]> {
  if (ttl > 0) {
    const hit = gcache<any[]>(sql, ttl);
    if (hit.hit) return hit.data!;
  }

  // 本地开发
  if (isLocalDev) {
    const result = await localQuery(sql);
    if (ttl > 0) scache(sql, result, ttl);
    return result;
  }

  const rows = await query(sql).catch(() => [] as any[]);
  if (ttl > 0) scache(sql, rows, ttl);
  return rows;
}

async function localQuery(sql: string): Promise<any[]> {
  const { db } = await import("./db");
  if (sql.includes("count(*)") && sql.includes("Product")) {
    const allProducts = sql.includes("1=1");
    const c = await db.product.count({ where: allProducts ? {} : { isActive: true } });
    return [{ total: c }];
  }
  if (sql.includes("slug =") && sql.includes("Product p")) {
    const m = sql.match(/slug\s*=\s*'([^']+)'/);
    if (m) { const p = await db.product.findUnique({ where: { slug: m[1] }, include: { category: true } }); return p ? [{ ...p, categoryName: p.category?.name, categorySlug: p.category?.slug }] : []; }
  }
  if (sql.includes("id =") && sql.includes("Product")) {
    const m = sql.match(/id\s*=\s*'([^']+)'/);
    if (m) { const p = await db.product.findUnique({ where: { id: m[1] } }); return p ? [p] : []; }
  }
  if (sql.includes("SELECT * FROM Product WHERE")) {
    const allProducts = sql.includes("1=1");
    const products = await db.product.findMany({ where: allProducts ? {} : { isActive: true }, orderBy: { createdAt: "desc" }, include: { category: true }, take: 50 });
    return products.map(p => ({ ...p, categoryName: p.category?.name, categorySlug: p.category?.slug }));
  }
  if (sql.includes("SELECT * FROM Category")) return db.category.findMany();
  if (sql.includes('"Order"')) {
    return db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }).then(r => r as unknown as any[]);
  }
  return [];
}

// ============ 导出 ============

export async function getProducts(opts: { where?: string; orderBy?: string; skip?: number; take?: number; ttl?: number }): Promise<any> {
  const { where = "isActive = 1", orderBy = "createdAt DESC", skip = 0, take = 24, ttl = 30000 } = opts;
  const [rows, counts] = await Promise.all([
    cachedQuery(`SELECT * FROM Product WHERE ${where} ORDER BY ${orderBy} LIMIT ${take} OFFSET ${skip}`, ttl),
    cachedQuery(`SELECT count(*) as total FROM Product WHERE ${where}`, ttl),
  ]);
  return { products: rows, total: Number(counts[0]?.total || 0) };
}

export async function getProductBySlug(slug: string): Promise<any> {
  const rows = await cachedQuery(
    `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug = '${slug.replace(/'/g, "''")}'`,
    30000
  );
  if (!rows[0]) return null;
  return { ...rows[0], category: { name: rows[0].categoryName, slug: rows[0].categorySlug } };
}

export async function getProductById(id: string): Promise<any> {
  const rows = await cachedQuery(`SELECT * FROM Product WHERE id = '${id}'`, 0);
  return rows[0] || null;
}

export async function getCategories(): Promise<any[]> {
  return cachedQuery("SELECT * FROM Category ORDER BY name", 60000);
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  const rows = await cachedQuery(`SELECT * FROM Category WHERE slug = '${slug.replace(/'/g, "''")}'`, 30000);
  if (!rows[0]) return null;
  const p = await getProducts({ where: `isActive = 1 AND categoryId = '${rows[0].id}'`, take: 50, ttl: 30000 });
  return { ...rows[0], products: p.products };
}

export async function getOrders(page = 1, pageSize = 20): Promise<any> {
  const [rows, cnt] = await Promise.all([
    cachedQuery(`SELECT * FROM "Order" ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`, 0),
    cachedQuery('SELECT count(*) as total FROM "Order"', 0),
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

export function clearCache() { CACHE.clear(); }
