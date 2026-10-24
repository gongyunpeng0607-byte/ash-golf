import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProducts, getCategories } from "@/lib/data";
import { revalidateProductCache } from "@/lib/revalidate";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

// --- GET ---
export async function GET(request: NextRequest) {
  try {
    const sp = new URL(request.url).searchParams;
    const page = parseInt(sp.get("page") || "1");
    const ps = parseInt(sp.get("pageSize") || "12");
    const sort = sp.get("sort") || "newest";
    const q = sp.get("search") || "";
    const cid = sp.get("categoryId") || "";

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { brand: { contains: q } },
      ];
    }
    if (cid) where.categoryId = cid;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price-asc" ? { price: "asc" } : sort === "price-desc" ? { price: "desc" } : { createdAt: "desc" };

    const [{ products, total }, cats] = await Promise.all([
      getProducts({ where, orderBy, skip: (page - 1) * ps, take: ps }),
      getCategories(),
    ]);
    return NextResponse.json({ products, total, page, ps, totalPages: Math.ceil(total / ps), categories: cats });
  } catch {
    return NextResponse.json({ products: [], total: 0 });
  }
}

// --- POST ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证 slug 格式：只允许小写字母、数字、连字符、下划线
    if (body.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug)) {
      return NextResponse.json({
        success: false,
        error: "Slug 格式無效：只能使用小寫英文、數字和連字符（如 taylormade-stealth-2）",
      }, { status: 400 });
    }

    // 检查 slug 是否已存在
    const existing = await db.product.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "此網址 Slug 已被使用，請換一個" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        specs: body.specs ?? null,
        price: Math.max(0, parseInt(body.price) || 0),
        comparePrice: body.comparePrice ? parseInt(body.comparePrice) : null,
        stock: parseInt(body.stock) || 0,
        isActive: body.isActive !== false,
        isFeatured: !!body.isFeatured,
        images: body.images || "[]",
        categoryId: body.categoryId,
        brand: body.brand ?? null,
        tags: body.tags || "[]",
      },
    });

    // 刷新 ISR 页面缓存（首页/列表页/所属分类页）
    const catSlug = body.categoryId
      ? (await db.category.findUnique({ where: { id: body.categoryId } }))?.slug
      : undefined;
    await revalidateProductCache({ productSlug: body.slug, categorySlug: catSlug });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
