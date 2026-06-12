import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/turso-db";

export const dynamic = "force-dynamic";

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
  return (data.results || []).every((r: any) => r.type === "ok");
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
    const url = process.env.TURSO_DB_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
      const { db } = await import("@/lib/db");
      const product = await db.product.update({ where: { id }, data: body });
      return NextResponse.json({ success: true, product });
    }

    const esc = (s: string) => String(s||"").replace(/'/g,"''");
    const sets: string[] = [];
    const map: Record<string,string> = {
      name: `'${esc(body.name)}'`, slug: `'${esc(body.slug)}'`, description: `'${esc(body.description)}'`,
      price: String(Number(body.price)||0), stock: String(Number(body.stock)||0),
      isActive: body.isActive!==false?"1":"0", isFeatured: body.isFeatured?"1":"0",
      categoryId: `'${esc(body.categoryId)}'`, brand: body.brand?`'${esc(body.brand)}'`:"NULL",
      specs: body.specs?`'${esc(body.specs)}'`:"NULL", tags: `'${esc(body.tags||"[]")}'`,
    };
    if (body.comparePrice != null) map.comparePrice = String(Number(body.comparePrice));

    for (const [k,v] of Object.entries(map)) {
      if (body[k] !== undefined) sets.push(`${k}=${v}`);
    }
    sets.push(`updatedAt='${new Date().toISOString().replace("T"," ").slice(0,19)}'`);

    const ok = await tursoExecMulti([`UPDATE Product SET ${sets.join(",")} WHERE id='${id}'`]);
    if (!ok) throw new Error("更新失敗");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message||"更新失敗" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const url = process.env.TURSO_DB_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (url && token) {
      const ok = await tursoExecMulti([
        `DELETE FROM OrderItem WHERE productId='${id}'`,
        `DELETE FROM CartItem WHERE productId='${id}'`,
        `DELETE FROM Product WHERE id='${id}'`,
      ]);
      if (!ok) throw new Error("刪除失敗");
      return NextResponse.json({ success: true });
    }

    const { db } = await import("@/lib/db");
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message||"刪除失敗" }, { status: 500 });
  }
}
