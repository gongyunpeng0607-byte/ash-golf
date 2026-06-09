import Link from "next/link";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany();

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
        <h1 className="text-2xl font-bold">新增商品</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
