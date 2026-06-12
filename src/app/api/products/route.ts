import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/turso-db";
import { uuid } from "@/lib/uuid";

export const dynamic = "force-dynamic";

// --- Turso 写入（返回详细错误）---
async function tursoWrite(sql: string): Promise<{ ok: boolean; error?: string }> {
  const u = process.env.TURSO_DB_URL;
  const t = process.env.TURSO_AUTH_TOKEN;
  if (!u || !t) return { ok: false, error: "missing env" };

  try {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch(`${u}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql } }] }),
      signal: ctl.signal,
    });
    clearTimeout(tm);
    const data = await res.json();
    const r = data.results?.[0];
    if (r?.type === "ok") return { ok: true };
    return { ok: false, error: r?.error?.message || `type=${r?.type}` };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// --- GET ---
export async function GET(request: NextRequest) {
  try {
    const sp = new URL(request.url).searchParams;
    const page = parseInt(sp.get("page") || "1");
    const ps = parseInt(sp.get("pageSize") || "12");
    const sort = sp.get("sort") || "newest";
    const q = sp.get("search") || "";
    const cid = sp.get("categoryId") || "";
    let w = "isActive = 1";
    if (q) w += ` AND (name LIKE '%${q.replace(/'/g,"''")}%' OR description LIKE '%${q.replace(/'/g,"''")}%' OR brand LIKE '%${q.replace(/'/g,"''")}%')`;
    if (cid) w += ` AND categoryId = '${cid}'`;
    const ob = sort === "price-asc" ? "price ASC" : sort === "price-desc" ? "price DESC" : "createdAt DESC";
    const [{ products, total }, cats] = await Promise.all([getProducts({ where: w, orderBy: ob, skip: (page - 1) * ps, take: ps }), getCategories()]);
    return NextResponse.json({ products, total, page, ps, totalPages: Math.ceil(total / ps), categories: cats });
  } catch { return NextResponse.json({ products: [], total: 0 }); }
}

// --- POST ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 本地回退
    if (!process.env.TURSO_AUTH_TOKEN) {
      try {
        const { db } = await import("@/lib/db");
        return NextResponse.json({ success: true, product: await db.product.create({ data: body }) }, { status: 201 });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    const id = uuid();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const sc = (v: any) => String(v ?? "").replace(/'/g, "''");
    const qu = (v: any) => (v != null && String(v).trim()) ? `'${sc(v)}'` : "NULL";

    // 写死——不用复杂拼接，保证零错误
    const name = sc(body.name || "");
    const slug = sc(body.slug || "");
    const desc = sc(body.description || "");
    const specs = qu(body.specs || null);
    const price = Math.max(0, parseInt(body.price) || 0);
    const cp = body.comparePrice ? parseInt(body.comparePrice) : "NULL";
    const stock = parseInt(body.stock) || 0;
    const active = body.isActive === false ? 0 : 1;
    const feat = body.isFeatured ? 1 : 0;
    const catId = sc(body.categoryId || "");
    const brand = qu(body.brand || null);
    const tags = `'${sc(body.tags || "[]")}'`;

    // 建表（幂等）
    const tbl = `CREATE TABLE IF NOT EXISTS Product(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,description TEXT NOT NULL,specs TEXT,price INTEGER NOT NULL DEFAULT 0,comparePrice INTEGER,stock INTEGER DEFAULT 0,isActive INTEGER DEFAULT 1,isFeatured INTEGER DEFAULT 0,images TEXT DEFAULT '[]',categoryId TEXT NOT NULL,brand TEXT,tags TEXT DEFAULT '[]',createdAt TEXT DEFAULT (datetime('now')),updatedAt TEXT DEFAULT (datetime('now')))`;
    await tursoWrite(tbl);

    // INSERT
    const ins = `INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt) VALUES('${id}','${name}','${slug}','${desc}',${specs},${price},${cp},${stock},${active},${feat},'[]','${catId}',${brand},${tags},'${now}','${now}')`;

    const ret = await tursoWrite(ins);
    if (!ret.ok) {
      return NextResponse.json({ success: false, error: ret.error || "寫入失敗", sql: ins.slice(0, 500) }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
