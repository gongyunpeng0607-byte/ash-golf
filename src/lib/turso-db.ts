/**
 * Turso HTTP API 数据访问层
 * 替代 Prisma，在 Vercel 无服务器环境中运行
 */

const TURSO_URL = process.env.TURSO_DB_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

async function exec(stmts: string[]) {
  // 本地开发时用 Prisma
  if (!TURSO_URL || !TURSO_TOKEN) return null;

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
  if (!results) return { cols: [], rows: [] as Array<Array<{ type: string; value: string | null }>> };
  const r = results[0];
  if (r.type !== "ok" || r.response.type !== "execute") return { cols: [], rows: [] as Array<Array<{ type: string; value: string | null }>> };
  return {
    cols: r.response.result.cols.map((c: { name: string }) => c.name),
    rows: r.response.result.rows as Array<Array<{ type: string; value: string | null }>>,
  };
}

function mapRow(cols: string[], row: Array<{ type: string; value: string | null }>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  cols.forEach((col, i) => {
    const cell = row[i];
    if (cell.type === "integer") {
      obj[col] = cell.value ? parseInt(cell.value) : (col.startsWith("is") ? 0 : null);
    } else {
      obj[col] = cell.value;
    }
  });
  return obj;
}

async function query<T>(sql: string): Promise<T[]> {
  // 本地开发：回退到 Prisma
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db: prisma } = await import("./db");
    const plainSql = sql.replace(/"/g, "'"); // Basic conversion
    return [] as T[]; // Can't run raw SQL on Prisma SQLite, return empty
  }

  const { cols, rows } = await queryRaw(sql);
  return rows.map(row => mapRow(cols, row)) as T[];
}

// ============ Product 查询 ============

export async function getProducts(opts: {
  where?: string;
  orderBy?: string;
  skip?: number;
  take?: number;
}) {
  const { where = "isActive = 1", orderBy = "createdAt DESC", skip = 0, take = 24 } = opts;
  const sql = `SELECT * FROM Product WHERE ${where} ORDER BY ${orderBy} LIMIT ${take} OFFSET ${skip}`;
  const countSql = `SELECT count(*) as total FROM Product WHERE ${where}`;

  // Check if running Turso
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    const [products, countResult] = await Promise.all([
      db.product.findMany({
        where: { isActive: true },
        orderBy: opts.orderBy?.includes("price") ? { price: opts.orderBy.includes("desc") ? "desc" as const : "asc" as const } : { createdAt: "desc" as const },
        skip,
        take,
        include: { category: true },
      }),
      db.product.count({ where: { isActive: true } }),
    ]);
    return { products, total: countResult };
  }

  const rows = await query<Record<string, unknown>>(sql);
  const counts = await query<{ total: number }>(countSql);
  return {
    products: rows.map(r => ({
      ...r,
      price: Number(r.price),
      comparePrice: r.comparePrice ? Number(r.comparePrice) : null,
      stock: Number(r.stock),
      isActive: Boolean(r.isActive),
      isFeatured: Boolean(r.isFeatured),
    })),
    total: counts[0]?.total || 0,
  };
}

export async function getProductBySlug(slug: string) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    return db.product.findUnique({ where: { slug }, include: { category: true } });
  }

  const rows = await query<Record<string, unknown>>(`SELECT p.*, c.name as categoryName, c.slug as categorySlug, c.description as categoryDescription FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.slug = '${slug.replace(/'/g, "''")}'`);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    price: Number(r.price),
    comparePrice: r.comparePrice ? Number(r.comparePrice) : null,
    stock: Number(r.stock),
    isActive: Boolean(r.isActive),
    isFeatured: Boolean(r.isFeatured),
    category: { id: r.categoryId as string, name: r.categoryName as string, slug: r.categorySlug as string, description: r.categoryDescription as string },
  };
}

export async function getProductById(id: string) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    return db.product.findUnique({ where: { id } });
  }
  const rows = await query<Record<string, unknown>>(`SELECT * FROM Product WHERE id = '${id}'`);
  if (rows.length === 0) return null;
  return { ...rows[0], price: Number(rows[0].price), stock: Number(rows[0].stock), isActive: Boolean(rows[0].isActive), isFeatured: Boolean(rows[0].isFeatured) };
}

// ============ Category 查询 ============

export async function getCategories() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    return db.category.findMany();
  }
  return query<Record<string, unknown>>("SELECT * FROM Category ORDER BY name");
}

export async function getCategoryBySlug(slug: string) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    return db.category.findUnique({ where: { slug }, include: { products: { where: { isActive: true }, orderBy: { createdAt: "desc" } } } });
  }
  const rows = await query<Record<string, unknown>>(`SELECT * FROM Category WHERE slug = '${slug.replace(/'/g, "''")}'`);
  if (rows.length === 0) return null;
  const cat = rows[0];
  const products = await getProducts({ where: `isActive = 1 AND categoryId = '${cat.id}'`, orderBy: "createdAt DESC", take: 50 });
  return { ...cat, products: products.products };
}

// ============ Order ============

export async function getOrders(page = 1, pageSize = 20) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    const [orders, total] = await Promise.all([
      db.order.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { items: { include: { product: true } } } }),
      db.order.count(),
    ]);
    return { orders, total };
  }
  const total = await query<{ total: number }>("SELECT count(*) as total FROM \"Order\"");
  const rows = await query<Record<string, unknown>>(`SELECT * FROM "Order" ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`);
  return { orders: rows, total: total[0]?.total || 0 };
}

export async function getOrderById(id: string) {
  if (!TURSO_URL || !TURSO_TOKEN) {
    const { db } = await import("./db");
    return db.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
  }
  const rows = await query<Record<string, unknown>>(`SELECT * FROM "Order" WHERE id = '${id}'`);
  if (rows.length === 0) return null;
  const order = rows[0];
  const items = await query<Record<string, unknown>>(`SELECT oi.*, p.name as productName, p.slug as productSlug FROM OrderItem oi JOIN Product p ON oi.productId = p.id WHERE oi.orderId = '${id}'`);
  return { ...order, items: items.map(i => ({ ...i, product: { name: i.productName, slug: i.productSlug } })) };
}

export async function createOrder(data: {
  orderNo: string; totalAmount: number; shippingFee: number;
  recipientName: string; recipientPhone: string; recipientEmail?: string;
  shippingAddress: string; shippingMethod: string; paymentMethod: string;
  note?: string; items: Array<{ id: string; productId: string; quantity: number; price: number }>;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const email = data.recipientEmail || "NULL";
  const note = data.note || "NULL";

  await exec([
    `INSERT INTO "Order"(id,orderNo,status,totalAmount,shippingFee,discount,recipientName,recipientPhone,recipientEmail,shippingAddress,shippingMethod,paymentMethod,paymentStatus,note,createdAt,updatedAt) VALUES('${id}','${data.orderNo}','pending',${data.totalAmount},${data.shippingFee},0,'${data.recipientName.replace(/'/g, "''")}','${data.recipientPhone.replace(/'/g, "''")}',${email === "NULL" ? "NULL" : `'${email.replace(/'/g, "''")}'`},'${data.shippingAddress.replace(/'/g, "''")}','${data.shippingMethod}','${data.paymentMethod}','unpaid',${note === "NULL" ? "NULL" : `'${note.replace(/'/g, "''")}'`},'${now}','${now}')`,
  ]);

  for (const item of data.items) {
    await exec([
      `INSERT INTO OrderItem(id,orderId,productId,quantity,price) VALUES('${item.id}','${id}','${item.productId}',${item.quantity},${item.price})`,
      `UPDATE Product SET stock = MAX(0, stock - ${item.quantity}) WHERE id = '${item.productId}'`,
    ]);
  }

  return { id, orderNo: data.orderNo };
}
