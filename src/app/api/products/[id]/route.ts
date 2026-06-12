import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

async function tursoWrite(sql: string): Promise<boolean> {
  const u = process.env.TURSO_DB_URL;
  const t = process.env.TURSO_AUTH_TOKEN;
  if (!u || !t) return false;
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
    return data.results?.[0]?.type === "ok";
  } catch { return false; }
}

// GET
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  return NextResponse.json({ product });
}

// PUT — 支持部分更新
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

    // 只更新传入的字段
    if (body.name !== undefined) sets.push(`name='${s(body.name)}'`);
    if (body.slug !== undefined) sets.push(`slug='${s(body.slug)}'`);
    if (body.description !== undefined) sets.push(`description='${s(body.description)}'`);
    if (body.price !== undefined) sets.push(`price=${Math.max(0, parseInt(body.price) || 0)}`);
    if (body.comparePrice !== undefined) sets.push(`comparePrice=${body.comparePrice != null ? parseInt(body.comparePrice) : "NULL"}`);
    if (body.stock !== undefined) sets.push(`stock=${parseInt(body.stock) || 0}`);
    if (body.isActive !== undefined) sets.push(`isActive=${body.isActive === false ? 0 : 1}`);
    if (body.isFeatured !== undefined) sets.push(`isFeatured=${body.isFeatured ? 1 : 0}`);
    if (body.categoryId !== undefined) sets.push(`categoryId='${s(body.categoryId)}'`);
    if (body.brand !== undefined) sets.push(`brand=${body.brand ? `'${s(body.brand)}'` : "NULL"}`);
    if (body.specs !== undefined) sets.push(`specs=${body.specs ? `'${s(body.specs)}'` : "NULL"}`);
    if (body.tags !== undefined) sets.push(`tags='${s(body.tags || "[]")}'`);
    if (body.images !== undefined) sets.push(`images='${s(body.images)}'`);

    sets.push(`updatedAt='${new Date().toISOString().replace("T", " ").slice(0, 19)}'`);

    const ok = await tursoWrite(`UPDATE Product SET ${sets.join(",")} WHERE id='${id}'`);
    if (!ok) return NextResponse.json({ success: false, error: "更新失敗" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = process.env.TURSO_AUTH_TOKEN;

    if (token) {
      await tursoWrite(`DELETE FROM OrderItem WHERE productId='${id}'`);
      await tursoWrite(`DELETE FROM CartItem WHERE productId='${id}'`);
      await tursoWrite(`DELETE FROM Product WHERE id='${id}'`);
      return NextResponse.json({ success: true });
    }

    const { db } = await import("@/lib/db");
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
