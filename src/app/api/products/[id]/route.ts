import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/turso-db";

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

    if (tursoUrl && tursoToken) {
      const sets: string[] = [];
      if (body.name !== undefined) sets.push(`name = '${String(body.name).replace(/'/g,"''")}'`);
      if (body.slug !== undefined) sets.push(`slug = '${String(body.slug).replace(/'/g,"''")}'`);
      if (body.description !== undefined) sets.push(`description = '${String(body.description).replace(/'/g,"''")}'`);
      if (body.price !== undefined) sets.push(`price = ${Number(body.price)}`);
      if (body.comparePrice !== undefined) sets.push(`comparePrice = ${body.comparePrice != null ? Number(body.comparePrice) : "NULL"}`);
      if (body.stock !== undefined) sets.push(`stock = ${Number(body.stock)}`);
      if (body.isActive !== undefined) sets.push(`isActive = ${body.isActive ? 1 : 0}`);
      if (body.isFeatured !== undefined) sets.push(`isFeatured = ${body.isFeatured ? 1 : 0}`);
      if (body.images !== undefined) sets.push(`images = '${String(body.images).replace(/'/g,"''")}'`);
      if (body.categoryId !== undefined) sets.push(`categoryId = '${String(body.categoryId)}'`);
      if (body.brand !== undefined) sets.push(`brand = ${body.brand ? `'${String(body.brand).replace(/'/g,"''")}'` : "NULL"}`);
      if (body.specs !== undefined) sets.push(`specs = ${body.specs ? `'${String(body.specs).replace(/'/g,"''")}'` : "NULL"}`);
      if (body.tags !== undefined) sets.push(`tags = '${String(body.tags).replace(/'/g,"''")}'`);
      sets.push(`updatedAt = '${new Date().toISOString()}'`);

      await fetch(`${tursoUrl}/v2/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: `UPDATE Product SET ${sets.join(", ")} WHERE id = '${id}'` } }] }),
      });

      return NextResponse.json({ success: true, product: { id, ...body } });
    }

    // Fallback
    const { db } = await import("@/lib/db");
    const product = await db.product.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
      await fetch(`${tursoUrl}/v2/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [
          { type: "execute", stmt: { sql: `DELETE FROM CartItem WHERE productId = '${id}'` } },
          { type: "execute", stmt: { sql: `DELETE FROM Product WHERE id = '${id}'` } },
        ]}),
      });
      return NextResponse.json({ success: true });
    }

    const { db } = await import("@/lib/db");
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
