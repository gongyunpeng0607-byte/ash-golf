import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/turso-db";

export const runtime = "nodejs";

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
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      const { db } = await import("@/lib/db");
      const product = await db.product.update({ where: { id }, data: body });
      return NextResponse.json({ success: true, product });
    }

    const esc = (s: string) => (s || "").replace(/'/g, "''");
    const sets: string[] = [];

    const fields: Record<string, string> = {
      name: `'${esc(body.name)}'`,
      slug: `'${esc(body.slug)}'`,
      description: `'${esc(body.description)}'`,
      price: String(Number(body.price) || 0),
      comparePrice: body.comparePrice != null ? String(Number(body.comparePrice)) : "NULL",
      stock: String(Number(body.stock) || 0),
      isActive: body.isActive ? "1" : "0",
      isFeatured: body.isFeatured ? "1" : "0",
      categoryId: `'${esc(body.categoryId)}'`,
      brand: body.brand ? `'${esc(body.brand)}'` : "NULL",
      specs: body.specs ? `'${esc(body.specs)}'` : "NULL",
      tags: `'${esc(body.tags || "[]")}'`,
    };

    for (const [key, val] of Object.entries(fields)) {
      if (body[key] !== undefined) sets.push(`${key} = ${val}`);
    }
    sets.push(`updatedAt = '${new Date().toISOString()}'`);

    const stmts: Array<{ type: string; stmt: { sql: string } }> = [
      { type: "execute", stmt: { sql: `UPDATE Product SET ${sets.join(", ")} WHERE id = '${id}'` } },
    ];

    // 图片分开更新
    if (body.images !== undefined && body.images !== "[]" && body.images.length < 50000) {
      stmts.push({ type: "execute", stmt: { sql: `UPDATE Product SET images = '${esc(body.images)}' WHERE id = '${id}'` } });
    }

    const res = await fetch(`${tursoUrl}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: stmts }),
    });

    if (!res.ok) throw new Error(await res.text());
    return NextResponse.json({ success: true, product: { id, ...body } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "更新失敗" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
      const stmts = [
        { type: "execute", stmt: { sql: `DELETE FROM OrderItem WHERE productId = '${id}'` } },
        { type: "execute", stmt: { sql: `DELETE FROM CartItem WHERE productId = '${id}'` } },
        { type: "execute", stmt: { sql: `DELETE FROM Product WHERE id = '${id}'` } },
      ];

      await fetch(`${tursoUrl}/v2/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: stmts }),
      });
      return NextResponse.json({ success: true });
    }

    const { db } = await import("@/lib/db");
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "刪除失敗" }, { status: 500 });
  }
}
