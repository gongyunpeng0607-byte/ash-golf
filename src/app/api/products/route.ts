import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

// ====== Turso 写入（带3次重试） ======
async function tursoWrite(sql: string): Promise<boolean> {
  const url = process.env.TURSO_DB_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return false;

  for (let i = 0; i < 3; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${url}/v2/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [{ type: "execute", stmt: { sql } }]
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const r = data.results?.[0];
        if (r?.type === "ok") return true;
        // SQL 语法错误不需要重试
        if (r?.type === "error") {
          console.error("Turso SQL error:", r.error?.message, "| SQL:", sql.slice(0, 200));
          return false;
        }
      }
    } catch (err) {
      console.error(`Turso attempt ${i + 1} failed:`, err instanceof Error ? err.message : err);
    }
    // 退避重试
    if (i < 2) await new Promise(r => setTimeout(r, 800 * (i + 1)));
  }
  return false;
}

// ====== GET ======
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

// ====== POST ======
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = process.env.TURSO_AUTH_TOKEN;

    // 本地开发回退 Prisma
    if (!token) {
      try {
        const { db } = await import("@/lib/db");
        const product = await db.product.create({ data: body });
        return NextResponse.json({ success: true, product }, { status: 201 });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const esc = (s: any) => String(s ?? "").replace(/'/g, "''");
    const orNull = (v: any) => (v && String(v).trim()) ? `'${esc(v)}'` : "NULL";

    // 基本字段
    const name = esc(body.name || "");
    const slug = esc(body.slug || "");
    const desc = esc(body.description || "");
    const price = Math.max(0, parseInt(body.price) || 0);
    const cmpPrice = body.comparePrice ? parseInt(body.comparePrice) : "NULL";
    const stock = parseInt(body.stock) || 0;
    const active = body.isActive === false ? 0 : 1;
    const feat = body.isFeatured ? 1 : 0;
    const catId = esc(body.categoryId || "");
    const brand = orNull(body.brand);
    const specs = orNull(body.specs);
    const tags = `'${esc(body.tags || "[]")}'`;

    // 图片 — 压缩后 base64 可能很长，单独 UPDATE
    const images = body.images || "[]";

    // 先 INSERT 再 UPDATE images（避免 SQL 过大）
    const insert = `INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt) VALUES('${id}','${name}','${slug}','${desc}',${specs},${price},${cmpPrice},${stock},${active},${feat},'[]','${catId}',${brand},${tags},'${now}','${now}')`;

    const ok1 = await tursoWrite(insert);
    if (!ok1) {
      // 可能表不存在，先建表再试
      await tursoWrite(`CREATE TABLE IF NOT EXISTS Product(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT NOT NULL,specs TEXT,price INTEGER NOT NULL DEFAULT 0,comparePrice INTEGER,stock INTEGER DEFAULT 0,isActive INTEGER DEFAULT 1,isFeatured INTEGER DEFAULT 0,images TEXT DEFAULT '[]',categoryId TEXT NOT NULL,brand TEXT,tags TEXT DEFAULT '[]',createdAt TEXT DEFAULT (datetime('now')),updatedAt TEXT DEFAULT (datetime('now')))`);
      const ok2 = await tursoWrite(insert);
      if (!ok2) throw new Error("Turso 寫入失敗");
    }

    // 异步更新图片
    if (images && images !== "[]") {
      await tursoWrite(`UPDATE Product SET images = '${esc(images)}' WHERE id = '${id}'`);
    }

    return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
  } catch (error: any) {
    console.error("POST error:", error.message);
    return NextResponse.json({ success: false, error: error.message || "建立失敗" }, { status: 500 });
  }
}
