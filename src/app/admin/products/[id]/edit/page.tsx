import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getCategories } from "@/lib/turso-db";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props { params: Promise<{ id: string }>; }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-10">
        <Link href="/admin/products" className="text-xs text-ash-gray-400 hover:text-ash-black transition-colors">商品管理</Link>
        <span className="text-ash-gray-300">/</span>
        <h1 className="text-[22px] font-bold tracking-tight">編輯商品</h1>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
