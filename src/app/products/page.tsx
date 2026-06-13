export const dynamic = 'force-dynamic';
export const revalidate = 5;
import { Suspense } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/turso-db";
import { ProductCard } from "@/components/products/ProductCard";
import { SortSelect } from "@/components/products/SortSelect";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "全部商品 | ASH GOLF" };

interface Props { searchParams: Promise<{ category?: string; sort?: string; search?: string; page?: string }>; }

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sort = params.sort || "newest";
  const search = params.search || "";
  const categoryFilter = params.category || "";
  const pageSize = 24;

  let where = "isActive = 1";
  if (search) where += ` AND (name LIKE '%${search.replace(/'/g, "''")}%' OR description LIKE '%${search.replace(/'/g, "''")}%' OR brand LIKE '%${search.replace(/'/g, "''")}%')`;
  if (categoryFilter) where += ` AND categoryId = '${categoryFilter}'`;
  const orderBy = sort === "price-asc" ? "price ASC" : sort === "price-desc" ? "price DESC" : "createdAt DESC";

  const [{ products, total }, categories] = await Promise.all([
    getProducts({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-500 mb-3">COLLECTION</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-ash-black">全部商品</h1>
        <p className="text-sm text-ash-gray-500 mt-1">{total} 件商品</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-[200px] shrink-0">
          <form className="mb-8">
            <input name="search" defaultValue={search} placeholder="搜尋" className="w-full bg-transparent border-b border-ash-gray-300 pb-2.5 text-sm outline-none focus:border-ash-black transition-colors placeholder:text-ash-gray-400" />
          </form>
          <div className="mb-8">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 mb-4">分類</h3>
            <ul className="space-y-2">
              <li><a href="/products" className={`block text-[13px] py-1 ${!categoryFilter ? "text-ash-black font-medium" : "text-ash-gray-500 hover:text-ash-black"}`}>全部分類</a></li>
              {categories.map((cat: Record<string,unknown>) => (
                <li key={cat.id as string}><a href={`/products?category=${cat.id}`} className={`block text-[13px] py-1 ${categoryFilter === cat.id ? "text-ash-black font-medium" : "text-ash-gray-500 hover:text-ash-black"}`}>{cat.name as string}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 mb-4">排序</h3>
            <Suspense fallback={<select className="w-full bg-transparent border-b border-ash-gray-300 pb-2.5 text-xs" disabled><option>載入中</option></select>}><SortSelect /></Suspense>
          </div>
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-32"><p className="text-6xl mb-4 opacity-30">🔍</p><p className="text-ash-gray-500 text-sm">沒有找到相關商品</p><Link href="/products" className="text-[11px] tracking-wider uppercase text-ash-black underline mt-4 inline-block">清除篩選</Link></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {products.map((p: Record<string,unknown>) => <ProductCard key={p.id as string} product={p as any} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-16">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                    const qs = new URLSearchParams();
                    if (search) qs.set("search", search);
                    if (categoryFilter) qs.set("category", categoryFilter);
                    if (sort !== "newest") qs.set("sort", sort);
                    if (p > 1) qs.set("page", String(p));
                    const str = qs.toString();
                    return <a key={p} href={`/products${str ? `?${str}` : ""}`} className={`w-9 h-9 flex items-center justify-center text-xs ${page === p ? "bg-ash-black text-white" : "border border-ash-gray-200 hover:border-ash-black"}`}>{p}</a>;
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
