import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProductById } from "@/lib/data";
import { revalidateProductCache } from "@/lib/revalidate";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

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

    const data: Prisma.ProductUncheckedUpdateInput = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = parseInt(body.price) || 0;
    if (body.comparePrice !== undefined) {
      const cp = parseInt(body.comparePrice);
      data.comparePrice = isNaN(cp) || cp <= 0 ? null : cp;
    }
    if (body.stock !== undefined) data.stock = parseInt(body.stock) || 0;
    if (body.isActive !== undefined) data.isActive = body.isActive !== false;
    if (body.isFeatured !== undefined) data.isFeatured = !!body.isFeatured;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.brand !== undefined) data.brand = body.brand || null;
    if (body.specs !== undefined) data.specs = body.specs || null;
    if (body.tags !== undefined) data.tags = body.tags || "[]";
    if (body.images !== undefined) data.images = body.images;

    await db.product.update({ where: { id }, data });

    // 刷新 ISR 页面缓存
    const fresh = await getProductById(id);
    await revalidateProductCache({
      productSlug: fresh?.slug,
      categorySlug: fresh?.category?.slug,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // 先查 product 拿到 slug，用于 ISR revalidation
    const product = await getProductById(id);

    // OrderItem 没有级联删除，需先手动清除；CartItem 已设 onDelete: Cascade
    await db.orderItem.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });

    await revalidateProductCache({
      productSlug: product?.slug,
      categorySlug: product?.category?.slug,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
