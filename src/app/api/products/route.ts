import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/turso-db";
import { uuid } from "@/lib/uuid";

export const dynamic = "force-dynamic";

// --- Turso 写入核心 ---
async function tursoWrite(sql: string): Promise<boolean> {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${url}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql } }] }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return false;
    const data = await res.json();
    const r = data.results?.[0];
    if (r?.type === "ok") return true;
    // SQL 错误
    if (r?.error) console.error("Turso SQL:", r.error.message, "|", sql.slice(0, 100));
    return false;
  } catch (e: any) {
    console.error("Turso fetch:", e.message);
    return false;
  }
}

async function tursoExec(sqls: string[]): Promise<boolean> {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const reqs = sqls.map(sql => ({ type: "execute" as const, stmt: { sql } }));
    const res = await fetch(`${url}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: reqs }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = await res.json();
    return (data.results || []).every((r: any) => r.type === "ok");
  } catch (e: any) {
    console.error("Turso exec:", e.message);
    return false;
  }
}

// --- GET ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";

    let where = "isActive = 1";
    if (search) where += ` AND (name LIKE '%${search.replace(/'/g, "''")}%' OR description LIKE '%${search.replace(/'/g, "''")}%' OR brand LIKE '%${search.replace(/'/g, "''")}%')`;
    if (categoryId) where += ` AND categoryId = '${categoryId}'`;
    const orderBy = sort === "price-asc" ? "price ASC" : sort === "price-desc" ? "price DESC" : "createdAt DESC";

    const [{ products, total }, categories] = await Promise.all([
      getProducts({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
      getCategories(),
    ]);
    return NextResponse.json({ products, total, page, pageSize, totalPages: Math.ceil(total / pageSize), categories });
  } catch {
    return NextResponse.json({ products: [], total: 0, page: 1, pageSize: 12, totalPages: 0, categories: [] });
  }
}

// --- POST ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 本地开发 → Prisma
    if (!process.env.TURSO_AUTH_TOKEN) {
      const { db } = await import("@/lib/db");
      const product = await db.product.create({ data: body });
      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    const id = uuid();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const s = (v: any) => String(v ?? "");
    const e = (v: any) => s(v).replace(/'/g, "''");
    const q = (v: any) => s(v).trim() ? `'${e(v)}'` : "NULL";

    // 先确保表存在
    await tursoExec([
      `CREATE TABLE IF NOT EXISTS Product(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT NOT NULL,specs TEXT,price INTEGER NOT NULL DEFAULT 0,comparePrice INTEGER,stock INTEGER DEFAULT 0,isActive INTEGER DEFAULT 1,isFeatured INTEGER DEFAULT 0,images TEXT DEFAULT '[]',categoryId TEXT NOT NULL,brand TEXT,tags TEXT DEFAULT '[]',createdAt TEXT DEFAULT (datetime('now')),updatedAt TEXT DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS Category(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT,image TEXT,parentId TEXT,createdAt TEXT DEFAULT (datetime('now')),updatedAt TEXT DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS "Order"(id TEXT PRIMARY KEY NOT NULL,orderNo TEXT UNIQUE NOT NULL,userId TEXT,status TEXT DEFAULT 'pending',totalAmount INTEGER NOT NULL,shippingFee INTEGER DEFAULT 0,discount INTEGER DEFAULT 0,recipientName TEXT NOT NULL,recipientPhone TEXT NOT NULL,recipientEmail TEXT,shippingAddress TEXT NOT NULL,shippingMethod TEXT DEFAULT 'home',paymentMethod TEXT NOT NULL,paymentStatus TEXT DEFAULT 'unpaid',note TEXT,createdAt TEXT DEFAULT (datetime('now')),updatedAt TEXT DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS OrderItem(id TEXT PRIMARY KEY NOT NULL,orderId TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,productId TEXT NOT NULL REFERENCES Product(id),quantity INTEGER NOT NULL,price INTEGER NOT NULL)`,
    ]);

    // 插入商品 — images 永远存 '[]'，图片太大不塞 SQL
    const price = Math.max(0, parseInt(body.price) || 0);
    const cmpPrice = body.comparePrice ? parseInt(body.comparePrice) : "NULL";
    const stock = parseInt(body.stock) || 0;
    const active = body.isActive === false ? 0 : 1;
    const feat = body.isFeatured ? 1 : 0;

    const sql = [
      `INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt)`,
      `VALUES('${id}','${e(body.name)}','${e(body.slug)}','${e(body.description)}',${q(body.specs)},${price},${cmpPrice},${stock},${active},${feat},'[]','${e(body.categoryId)}',${q(body.brand)},'${e(body.tags||"[]")}','${now}','${now}')`,
    ].join(" ");

    let ok = await tursoWrite(sql);

    // 失败重试一次
    if (!ok) {
      await new Promise(r => setTimeout(r, 1000));
      ok = await tursoWrite(sql);
    }

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Turso 寫入失敗，請稍後再試" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
  } catch (error: any) {
    console.error("POST error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "建立失敗" },
      { status: 500 }
    );
  }
}
