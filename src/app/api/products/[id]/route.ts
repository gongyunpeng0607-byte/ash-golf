import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

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
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql } }] }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const r = data.results?.[0];
        if (r?.type === "ok") return true;
        if (r?.type === "error") { console.error("Turso SQL error:", r.error?.message); return false; }
      }
    } catch (err) {
      console.error(`Turso attempt ${i + 1} failed:`, err instanceof Error ? err.message : String(err));
    }
    if (i < 2) await new Promise(r => setTimeout(r, 800 * (i + 1)));
  }
  return false;
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
      const product = await db.product.update({ where: { id }, data: body });
      return NextResponse.json({ success: true, product });
    }

    const esc = (s: any) => String(s ?? "").replace(/'/g, "''");
    const orNull = (v: any) => (v && String(v).trim()) ? `'${esc(v)}'` : "NULL";

    const sets: string[] = [
      `name='${esc(body.name)}'`,
      `slug='${esc(body.slug)}'`,
      `description='${esc(body.description)}'`,
      `price=${Math.max(0, parseInt(body.price) || 0)}`,
      `stock=${parseInt(body.stock) || 0}`,
      `isActive=${body.isActive !== false ? 1 : 0}`,
      `isFeatured=${body.isFeatured ? 1 : 0}`,
      `categoryId='${esc(body.categoryId)}'`,
      `brand=${orNull(body.brand)}`,
      `specs=${orNull(body.specs)}`,
      `tags='${esc(body.tags || "[]")}'`,
    ];
    if (body.comparePrice != null) sets.push(`comparePrice=${parseInt(body.comparePrice) || 0}`);
    sets.push(`updatedAt='${new Date().toISOString().replace("T", " ").slice(0, 19)}'`);

    const ok = await tursoWrite(`UPDATE Product SET ${sets.join(",")} WHERE id='${id}'`);
    if (!ok) throw new Error("Turso 更新失敗");

    // 图片单独更新
    const images = body.images;
    if (images && images !== "[]") {
      await tursoWrite(`UPDATE Product SET images='${esc(images)}' WHERE id='${id}'`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = process.env.TURSO_AUTH_TOKEN;

    if (token) {
      await tursoWrite(`DELETE FROM OrderItem WHERE productId='${id}'`);
      await tursoWrite(`DELETE FROM CartItem WHERE productId='${id}'`);
      const ok = await tursoWrite(`DELETE FROM Product WHERE id='${id}'`);
      if (!ok) throw new Error("Turso 刪除失敗");
      return NextResponse.json({ success: true });
    }

    const { db } = await import("@/lib/db");
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "刪除失敗" }, { status: 500 });
  }
}
