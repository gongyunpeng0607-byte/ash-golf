import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories, clearCache } from "@/lib/turso-db";
import { uuid } from "@/lib/uuid";
import { revalidateProductCache } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

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
    return { ok: false, error: r?.error?.message || "unknown error" };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

async function tursoCount(sql: string): Promise<number> {
  const u = process.env.TURSO_DB_URL;
  const t = process.env.TURSO_AUTH_TOKEN;
  if (!u || !t) return -1;
  try {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), 10000);
    const res = await fetch(`${u}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql } }] }),
      signal: ctl.signal,
    });
    clearTimeout(tm);
    const data = await res.json();
    const r = data.results?.[0];
    if (r?.type === "ok") {
      const rows = r.response.result.rows;
      return parseInt(rows?.[0]?.[0]?.value || "0");
    }
    return -1;
  } catch { return -1; }
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
    if (q) w += ` AND (name LIKE '%${q.replace(/'/g, "''")}%' OR description LIKE '%${q.replace(/'/g, "''")}%' OR brand LIKE '%${q.replace(/'/g, "''")}%')`;
    if (cid) w += ` AND categoryId = '${cid}'`;
    const ob = sort === "price-asc" ? "price ASC" : sort === "price-desc" ? "price DESC" : "createdAt DESC";
    const [{ products, total }, cats] = await Promise.all([getProducts({ where: w, orderBy: ob, skip: (page - 1) * ps, take: ps, ttl: 10000 }), getCategories()]);
    return NextResponse.json({ products, total, page, ps, totalPages: Math.ceil(total / ps), categories: cats });
  } catch { return NextResponse.json({ products: [], total: 0 }); }
}

// --- POST ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 本地 Prisma 回退
    if (!process.env.TURSO_AUTH_TOKEN) {
      const { db } = await import("@/lib/db");
      return NextResponse.json({ success: true, product: await db.product.create({ data: body }) }, { status: 201 });
    }

    const id = uuid();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const s = (v: any) => String(v ?? "").replace(/'/g, "''");
    const q = (v: any) => (v != null && String(v).trim()) ? `'${s(v)}'` : "NULL";

    // 验证 slug 格式：只允许小写字母、数字、连字符、下划线
    if (body.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug)) {
      return NextResponse.json({
        success: false,
        error: "Slug 格式無效：只能使用小寫英文、數字和連字符（如 taylormade-stealth-2）",
      }, { status: 400 });
    }

    // 检查 slug 是否已存在
    const slugCount = await tursoCount(`SELECT count(*) FROM Product WHERE slug = '${s(body.slug)}'`);
    if (slugCount > 0) {
      return NextResponse.json({ success: false, error: "此網址 Slug 已被使用，請換一個" }, { status: 400 });
    }

    // 图片：小图直接存，大图后续 UPDATE（提高阈值适配 800px/0.75 质量）
    const images = body.images || "[]";
    const imgField = images.length < 200000 ? `'${s(images)}'` : "'[]'";

    const ins = [
      "INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt)",
      "VALUES(",
      `'${id}',`,
      `'${s(body.name)}',`,
      `'${s(body.slug)}',`,
      `'${s(body.description)}',`,
      `${q(body.specs)},`,
      `${Math.max(0, parseInt(body.price) || 0)},`,
      `${body.comparePrice ? parseInt(body.comparePrice) : "NULL"},`,
      `${parseInt(body.stock) || 0},`,
      `${body.isActive === false ? 0 : 1},`,
      `${body.isFeatured ? 1 : 0},`,
      `${imgField},`,
      `'${s(body.categoryId)}',`,
      `${q(body.brand)},`,
      `'${s(body.tags || "[]")}',`,
      `'${now}',`,
      `'${now}'`,
      ")",
    ].join(" ");

    const ret = await tursoWrite(ins);
    if (!ret.ok) {
      return NextResponse.json({ success: false, error: ret.error || "寫入失敗" }, { status: 500 });
    }

    // 大图片（>8KB）后续更新
    if (images && images !== "[]" && images.length >= 8000) {
      await tursoWrite(`UPDATE Product SET images = '${s(images)}' WHERE id = '${id}'`);
    }

    clearCache(); // 新建商品后清除内存缓存
    // 刷新 ISR 页面缓存（首页/列表页/所属分类页）
    const catSlug = body.categoryId
      ? (await getCategories()).find((c: Record<string, unknown>) => c.id === body.categoryId)?.slug
      : undefined;
    await revalidateProductCache({ productSlug: body.slug, categorySlug: catSlug as string });
    return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
