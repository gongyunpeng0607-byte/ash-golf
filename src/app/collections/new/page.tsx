import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { SortSelect } from "@/components/products/SortSelect";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEW ARRIVALS 新品上市 | ASH GOLF",
  description: "最新高爾夫商品上市，精選全球頂級品牌新品",
};

interface PageProps { searchParams: Promise<{ sort?: string; page?: string }>; }

export default async function NewArrivalsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sort = params.sort || "newest";
  const pageSize = 24;

  const orderBy: Record<string, string> = sort === "price-asc" ? { price: "asc" } : sort === "price-desc" ? { price: "desc" } : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { category: true } }),
    db.product.count({ where: { isActive: true } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-400 mb-3">COLLECTION</p>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">NEW ARRIVALS</h1>
        <p className="text-sm text-ash-gray-500 mt-2">新品上市 · {total} 件商品</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-[180px] shrink-0">
          <div className="mb-8">
            <Suspense fallback={<select className="w-full bg-transparent border-b border-ash-gray-300 pb-2.5 text-xs" disabled><option>載入中...</option></select>}>
              <SortSelect />
            </Suspense>
          </div>
          <Link href="/products" className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-400 hover:text-ash-black transition-colors">← 全部商品</Link>
        </aside>
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-32"><p className="text-6xl mb-4 opacity-20">📭</p><p className="text-sm text-ash-gray-500">暫無新品</p></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-16">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                    const qs = new URLSearchParams({ sort, ...(p > 1 && { page: String(p) }) }).toString();
                    return <a key={p} href={`/collections/new?${qs}`} className={`w-9 h-9 flex items-center justify-center text-xs ${page === p ? "bg-ash-black text-white" : "border border-ash-gray-200 hover:border-ash-black"}`}>{p}</a>;
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
