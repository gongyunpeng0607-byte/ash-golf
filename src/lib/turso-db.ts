/* eslint-disable @typescript-eslint/no-explicit-any */

const TURSO_URL = process.env.TURSO_DB_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";
const isTurso = !!(TURSO_URL && TURSO_TOKEN);

async function exec(stmts: string[]) {
  if (!isTurso) return null;
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts.map(sql => ({ type: "execute", stmt: { sql } })) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.results;
}

async function queryRaw(sql: string) {
  const results = await exec([sql]);
  if (!results) return { cols: [] as string[], rows: [] as any[][] };
  const r = results[0];
  if (r.type !== "ok" || r.response.type !== "execute") return { cols: [] as string[], rows: [] as any[][] };
  return {
    cols: r.response.result.cols.map((c: { name: string }) => c.name),
    rows: r.response.result.rows as any[][],
  };
}

function mapRow(cols: string[], row: any[]): any {
  const obj: any = {};
  cols.forEach((col, i) => {
    const cell = row[i];
    obj[col] = cell.type === "integer" ? (cell.value ? parseInt(cell.value) : 0) : cell.value;
  });
  return obj;
}

async function query(sql: string): Promise<any[]> {
  const { cols, rows } = await queryRaw(sql);
  return rows.map(row => mapRow(cols, row));
}

// ============ Products ============
export async function getProducts(opts: { where?: string; orderBy?: string; skip?: number; take?: number }): Promise<any> {
  const { where = "isActive = 1", orderBy = "createdAt DESC", skip = 0, take = 24 } = opts;

  if (!isTurso) {
    const { db } = await import("./db");
    const [products, total] = await Promise.all([
      db.product.findMany({ where: { isActive: true }, orderBy: orderBy.includes("price") ? { price: orderBy.includes("desc") ? "desc" as const : "asc" as const } : { createdAt: "desc" as const }, skip, take, include: { category: true } }),
      db.product.count({ where: { isActive: true } }),
    ]);
    return { products, total };
  }

  const sql = `SELECT * FROM Product WHERE ${where} ORDER BY ${orderBy} LIMIT ${take} OFFSET ${skip}`;
  const cntSql = `SELECT count(*) as total FROM Product WHERE ${where}`;
  const [rows, counts] = await Promise.all([query(sql), query(cntSql)]);
  return { products: rows, total: Number(counts[0]?.total || 0) };
}

export async function getProductBySlug(slug: string): Promise<any> {
  if (!isTurso) {
    const { db } = await import("./db");
    return db.product.findUnique({ where: { slug }, include: { category: true } });
  }
  const rows = await query(`SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug = '${slug.replace(/'/g, "''")}'`);
  if (!rows[0]) return null;
  const r = rows[0];
  return { ...r, category: { name: r.categoryName, slug: r.categorySlug } };
}

export async function getProductById(id: string): Promise<any> {
  if (!isTurso) { const { db } = await import("./db"); return db.product.findUnique({ where: { id } }); }
  const rows = await query(`SELECT * FROM Product WHERE id = '${id}'`);
  return rows[0] || null;
}

// ============ Categories ============
export async function getCategories(): Promise<any[]> {
  if (!isTurso) { const { db } = await import("./db"); return db.category.findMany(); }
  return query("SELECT * FROM Category ORDER BY name");
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  if (!isTurso) {
    const { db } = await import("./db");
    return db.category.findUnique({ where: { slug }, include: { products: { where: { isActive: true }, orderBy: { createdAt: "desc" } } } });
  }
  const rows = await query(`SELECT * FROM Category WHERE slug = '${slug.replace(/'/g, "''")}'`);
  if (!rows[0]) return null;
  const cat = rows[0];
  const p = await getProducts({ where: `isActive = 1 AND categoryId = '${cat.id}'`, orderBy: "createdAt DESC", take: 50 });
  return { ...cat, products: p.products };
}

// ============ Orders ============
export async function getOrders(page = 1, pageSize = 20): Promise<any> {
  if (!isTurso) {
    const { db } = await import("./db");
    const [orders, total] = await Promise.all([
      db.order.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { items: { include: { product: true } } } }),
      db.order.count(),
    ]);
    return { orders, total };
  }
  const [rows, cnt] = await Promise.all([
    query(`SELECT * FROM "Order" ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`),
    query('SELECT count(*) as total FROM "Order"'),
  ]);
  return { orders: rows, total: Number(cnt[0]?.total || 0) };
}

export async function getOrderById(id: string): Promise<any> {
  if (!isTurso) {
    const { db } = await import("./db");
    return db.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
  }
  const rows = await query(`SELECT * FROM "Order" WHERE id = '${id}'`);
  if (!rows[0]) return null;
  const items = await query(`SELECT oi.*, p.name as productName, p.slug as productSlug FROM OrderItem oi JOIN Product p ON oi.productId = p.id WHERE oi.orderId = '${id}'`);
  return { ...rows[0], items: items.map((i: any) => ({ ...i, product: { name: i.productName, slug: i.productSlug } })) };
}
