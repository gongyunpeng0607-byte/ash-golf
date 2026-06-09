import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-gray-500 hover:text-[#1a5632]"
        >
          商品管理
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">編輯商品</h1>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
