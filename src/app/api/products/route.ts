import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";

    let where = "isActive = 1";
    if (search) where += ` AND (name LIKE '%${search.replace(/'/g,"''")}%' OR description LIKE '%${search.replace(/'/g,"''")}%' OR brand LIKE '%${search.replace(/'/g,"''")}%')`;
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

async function tursoExecMulti(stmts: string[]): Promise<boolean> {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return false;

  const res = await fetch(`${url}/v2/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: stmts.map(sql => ({ type: "execute", stmt: { sql } })) }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  // 每条结果都必须是 "ok"
  return (data.results || []).every((r: any) => r.type === "ok");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = process.env.TURSO_DB_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    // 本地开发回退
    if (!url || !token) {
      const { db } = await import("@/lib/db");
      const product = await db.product.create({ data: body });
      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const esc = (s: string) => String(s || "").replace(/'/g, "''");
    const nv = (v: any) => (v !== undefined && v !== null && v !== "") ? String(v) : "NULL";

    // 不存超大 images base64（只存 JSON 数组占位，图片分开处理）
    const price = Math.max(0, parseInt(body.price) || 0);
    const comparePrice = body.comparePrice ? parseInt(body.comparePrice) : "NULL";
    const stock = parseInt(body.stock) || 0;
    const isActive = body.isActive === false ? 0 : 1;
    const isFeatured = body.isFeatured ? 1 : 0;
    const specs = body.specs ? `'${esc(body.specs)}'` : "NULL";
    const brand = body.brand ? `'${esc(body.brand)}'` : "NULL";

    // 先在确保表存在，再插入
    const ok1 = await tursoExecMulti([
      `CREATE TABLE IF NOT EXISTS Product(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT NOT NULL,specs TEXT,price INTEGER NOT NULL DEFAULT 0,comparePrice INTEGER,stock INTEGER DEFAULT 0,isActive INTEGER DEFAULT 1,isFeatured INTEGER DEFAULT 0,images TEXT DEFAULT '[]',categoryId TEXT NOT NULL,brand TEXT,tags TEXT DEFAULT '[]',createdAt TEXT DEFAULT (datetime('now')),updatedAt TEXT DEFAULT (datetime('now')))`
    ]);
    // CREATE TABLE 失败不影响（可能已存在）

    const ok2 = await tursoExecMulti([
      `INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt) VALUES('${id}','${esc(body.name)}','${esc(body.slug)}','${esc(body.description)}',${specs},${price},${comparePrice},${stock},${isActive},${isFeatured},'[]','${esc(body.categoryId)}',${brand},'${esc(body.tags || "[]")}','${now}','${now}')`
    ]);
    if (!ok2) throw new Error("Turso 寫入失敗");

    return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error.message);
    return NextResponse.json({ success: false, error: error.message || "建立失敗" }, { status: 500 });
  }
}
