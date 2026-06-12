/* eslint-disable */

const TURSO_URL = process.env.TURSO_DB_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

// 本地开发时用 Prisma
const isLocalDev = process.env.NODE_ENV !== "production" && (!TURSO_URL || !TURSO_TOKEN);

async function exec(stmts: string[]) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8秒超时
  try {
    const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: stmts.map((sql: string) => ({ type: "execute", stmt: { sql } })) }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()).results;
  } finally {
    clearTimeout(timer);
  }
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

async function localQuery(sql: string): Promise<any[]> {
  const { db } = await import("./db");
  // 简单路由：分析 SQL 意图
  if (sql.includes("count(*)") && sql.includes("Product")) {
    const c = await db.product.count({ where: { isActive: true } });
    return [{ total: c }];
  }
  if (sql.includes("SELECT * FROM Product") && sql.includes("slug")) {
    const match = sql.match(/slug\s*=\s*'([^']+)'/);
    if (match) {
      const p = await db.product.findUnique({ where: { slug: match[1] }, include: { category: true } });
      return p ? [{ ...p, categoryName: p.category?.name, categorySlug: p.category?.slug }] : [];
    }
  }
  if (sql.includes("SELECT * FROM Product") && sql.includes("id =")) {
    const match = sql.match(/id\s*=\s*'([^']+)'/);
    if (match) {
      const p = await db.product.findUnique({ where: { id: match[1] } });
      return p ? [p] : [];
    }
  }
  if (sql.includes("SELECT * FROM Product WHERE")) {
    const products = await db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    return products.map(p => ({ ...p, categoryName: p.category?.name, categorySlug: p.category?.slug }));
  }
  if (sql.includes("SELECT * FROM Category ORDER BY")) {
    return db.category.findMany();
  }
  if (sql.includes("SELECT * FROM Category WHERE slug")) {
    const match = sql.match(/slug\s*=\s*'([^']+)'/);
    if (match) {
      const c = await db.category.findUnique({ where: { slug: match[1] } });
      return c ? [c] : [];
    }
  }
  if (sql.includes('SELECT * FROM "Order"')) {
    const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } });
    return orders as any[];
  }
  return [] as any[];
}

async function safeQuery(sql: string): Promise<any[]> {
  if (isLocalDev) return localQuery(sql);
  try { return await query(sql); } catch { return []; }
}

// ============ Products ============
export async function getProducts(opts: { where?: string; orderBy?: string; skip?: number; take?: number }): Promise<any> {
  const { where = "isActive = 1", orderBy = "createdAt DESC", skip = 0, take = 24 } = opts;
  const sql = `SELECT * FROM Product WHERE ${where} ORDER BY ${orderBy} LIMIT ${take} OFFSET ${skip}`;
  const cnt = `SELECT count(*) as total FROM Product WHERE ${where}`;
  const [rows, counts] = await Promise.all([safeQuery(sql), safeQuery(cnt)]);
  return { products: rows, total: Number(counts[0]?.total || 0) };
}

export async function getProductBySlug(slug: string): Promise<any> {
  const rows = await safeQuery(`SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug = '${slug.replace(/'/g, "''")}'`);
  if (!rows[0]) return null;
  return { ...rows[0], category: { name: rows[0].categoryName, slug: rows[0].categorySlug } };
}

export async function getProductById(id: string): Promise<any> {
  const rows = await safeQuery(`SELECT * FROM Product WHERE id = '${id}'`);
  return rows[0] || null;
}

// ============ Categories ============
export async function getCategories(): Promise<any[]> {
  return safeQuery("SELECT * FROM Category ORDER BY name");
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  const rows = await safeQuery(`SELECT * FROM Category WHERE slug = '${slug.replace(/'/g, "''")}'`);
  if (!rows[0]) return null;
  const cat = rows[0];
  const p = await getProducts({ where: `isActive = 1 AND categoryId = '${cat.id}'`, orderBy: "createdAt DESC", take: 50 });
  return { ...cat, products: p.products };
}

// ============ Orders ============
export async function getOrders(page = 1, pageSize = 20): Promise<any> {
  const sql = `SELECT * FROM "Order" ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
  const cnt = 'SELECT count(*) as total FROM "Order"';
  const [rows, counts] = await Promise.all([safeQuery(sql), safeQuery(cnt)]);
  return { orders: rows, total: Number(counts[0]?.total || 0) };
}

export async function getOrderById(id: string): Promise<any> {
  const rows = await safeQuery(`SELECT * FROM "Order" WHERE id = '${id}'`);
  if (!rows[0]) return null;
  const items = await safeQuery(`SELECT oi.*, p.name as productName, p.slug as productSlug FROM OrderItem oi JOIN Product p ON oi.productId = p.id WHERE oi.orderId = '${id}'`);
  return { ...rows[0], items: items.map((i: any) => ({ ...i, product: { name: i.productName, slug: i.productSlug } })) };
}
