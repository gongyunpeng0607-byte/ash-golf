export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Link from "next/link";
import { getCategories } from "@/lib/turso-db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center gap-3 mb-10">
        <Link href="/admin/products" className="text-xs text-ash-gray-400 hover:text-ash-black transition-colors">商品管理</Link>
        <span className="text-ash-gray-300">/</span>
        <h1 className="text-[22px] font-bold tracking-tight">新增商品</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
