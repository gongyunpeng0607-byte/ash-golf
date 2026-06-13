import { NextRequest, NextResponse } from "next/server";
import { getProductById, clearCache } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

async function tursoWrite(sql: string): Promise<{ ok: boolean; error?: string }> {
  const u = process.env.TURSO_DB_URL;
  const t = process.env.TURSO_AUTH_TOKEN;
  if (!u || !t) return { ok: false, error: "no token" };
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
    return { ok: false, error: r?.error?.message || "unknown" };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!token) {
      const { db } = await import("@/lib/db");
      return NextResponse.json({ success: true, product: await db.product.update({ where: { id }, data: body }) });
    }

    const s = (v: any) => String(v ?? "").replace(/'/g, "''");
    const sets: string[] = [];
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    if (body.name !== undefined) sets.push(`name='${s(body.name)}'`);
    // slug 创建后不允许修改（避免 UNIQUE 冲突）
    if (body.description !== undefined) sets.push(`description='${s(body.description)}'`);
    if (body.price !== undefined) sets.push(`price=${parseInt(body.price) || 0}`);
    if (body.comparePrice !== undefined) {
      const cp = parseInt(body.comparePrice);
      sets.push(`comparePrice=${isNaN(cp) || cp <= 0 ? "NULL" : cp}`);
    }
    if (body.stock !== undefined) sets.push(`stock=${parseInt(body.stock) || 0}`);
    if (body.isActive !== undefined) sets.push(`isActive=${body.isActive === false ? 0 : 1}`);
    if (body.isFeatured !== undefined) sets.push(`isFeatured=${body.isFeatured ? 1 : 0}`);
    if (body.categoryId !== undefined) sets.push(`categoryId='${s(body.categoryId)}'`);
    if (body.brand !== undefined) sets.push(`brand=${body.brand ? `'${s(body.brand)}'` : "NULL"}`);
    if (body.specs !== undefined) sets.push(`specs=${body.specs ? `'${s(body.specs)}'` : "NULL"}`);
    if (body.tags !== undefined) sets.push(`tags='${s(body.tags || "[]")}'`);
    if (body.images !== undefined) {
      // images 可以很大（base64），单独作为一个 UPDATE 语句执行，避免跟其他字段挤在一起出问题
      const img = body.images;
      if (img && img !== "[]") {
        const okImg = await tursoWrite(`UPDATE Product SET images='${s(img)}', updatedAt='${now}' WHERE id='${id}'`);
        if (!okImg.ok) {
          return NextResponse.json({ success: false, error: "圖片更新失敗: " + (okImg.error || "") }, { status: 500 });
        }
      }
    }

    // 只更新非图片字段
    if (sets.length > 0) {
      sets.push(`updatedAt='${now}'`);
      const sql = `UPDATE Product SET ${sets.join(", ")} WHERE id='${id}'`;
      const res = await tursoWrite(sql);
      if (!res.ok) {
        return NextResponse.json({ success: false, error: res.error || "更新失敗" }, { status: 500 });
      }
    }

    clearCache();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = process.env.TURSO_AUTH_TOKEN;
    if (token) {
      await tursoWrite(`DELETE FROM OrderItem WHERE productId='${id}'`);
      await tursoWrite(`DELETE FROM CartItem WHERE productId='${id}'`);
      const res = await tursoWrite(`DELETE FROM Product WHERE id='${id}'`);
      if (!res.ok) return NextResponse.json({ success: false, error: "刪除失敗" }, { status: 500 });
      clearCache();
      return NextResponse.json({ success: true });
    }
    const { db } = await import("@/lib/db");
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
