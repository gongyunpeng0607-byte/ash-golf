import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/turso-db";

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
  } catch (e: any) {
    return NextResponse.json({ products: [], total: 0, page: 1, pageSize: 12, totalPages: 0, categories: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tursoUrl = process.env.TURSO_DB_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const images = body.images || "[]";
      const specs = body.specs || null;
      const comparePrice = body.comparePrice != null ? body.comparePrice : "NULL";
      const brand = body.brand || null;
      const tags = body.tags || "[]";
      const isFeatured = body.isFeatured ? 1 : 0;

      const sql = `INSERT INTO Product(id,name,slug,description,specs,price,comparePrice,stock,isActive,isFeatured,images,categoryId,brand,tags,createdAt,updatedAt) VALUES('${id}','${(body.name||"").replace(/'/g,"''")}','${(body.slug||"").replace(/'/g,"''")}','${(body.description||"").replace(/'/g,"''")}',${specs?`'${specs.replace(/'/g,"''")}'`:"NULL"},${body.price||0},${comparePrice},${body.stock||0},${body.isActive!==false?1:0},${isFeatured},'${images.replace(/'/g,"''")}','${body.categoryId}',${brand?`'${brand.replace(/'/g,"''")}'`:"NULL"},'${tags.replace(/'/g,"''")}','${now}','${now}')`;

      await fetch(`${tursoUrl}/v2/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tursoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql } }] }),
      });

      return NextResponse.json({ success: true, product: { id, ...body } }, { status: 201 });
    }

    // Fallback to local Prisma
    const { db } = await import("@/lib/db");
    const product = await db.product.create({ data: body });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
