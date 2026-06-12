import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/turso-db";

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      // 本地 Prisma
      const { db } = await import("@/lib/db");
      const product = await db.product.create({ data: body });
      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const esc = (s: string) => (s || "").replace(/'/g, "''");
    const nv = (v: any) => v != null ? String(v) : "NULL";

    // 先存空 images，再用 UPDATE 追加（避免 SQL 超长）
    const images = body.images || "[]";

    const sql = `INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt) VALUES('${id}','${esc(body.name)}','${esc(body.slug)}','${esc(body.description)}',${body.specs?`'${esc(body.specs)}'`:"NULL"},${nv(body.price)},${body.comparePrice!=null?body.comparePrice:"NULL"},${nv(body.stock||0)},${body.isActive!==false?1:0},${body.isFeatured?1:0},'[]','${esc(body.categoryId)}',${body.brand?`'${esc(body.brand)}'`:"NULL"},'${esc(body.tags||"[]")}','${now}','${now}')`;

    const stmts: Array<{ type: string; stmt: { sql: string } }> = [{ type: "execute", stmt: { sql } }];

    // 图片较大时异步更新
    if (images && images !== "[]" && images.length < 50000) {
      stmts.push({ type: "execute", stmt: { sql: `UPDATE Product SET images = '${esc(images)}' WHERE id = '${id}'` } });
    }

    const res = await fetch(`${tursoUrl}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: stmts }),
    });

    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "建立失敗" }, { status: 500 });
  }
}
