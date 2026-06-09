import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { SortSelect } from "@/components/products/SortSelect";
import { generateMetadata as seo } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = seo({ title: "全部商品" });

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sort = params.sort || "newest";
  const search = params.search || "";
  const categoryFilter = params.category || "";
  const pageSize = 24;

  const where: Record<string, unknown> = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { brand: { contains: search } },
    ];
  }
  if (categoryFilter) {
    where.categoryId = categoryFilter;
  }

  const orderBy: Record<string, string> =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where: where as any,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where: where as any }),
    db.category.findMany(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-500 mb-3">
          COLLECTION
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-ash-black">全部商品</h1>
        <p className="text-sm text-ash-gray-500 mt-1">{total} 件商品</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="lg:w-[200px] shrink-0">
          {/* Search */}
          <form className="mb-8">
            <input
              name="search"
              defaultValue={search}
              placeholder="搜尋"
              className="w-full bg-transparent border-b border-ash-gray-300 pb-2.5 text-sm outline-none focus:border-ash-black transition-colors placeholder:text-ash-gray-400"
            />
          </form>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 mb-4">分類</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  className={`block text-[13px] py-1 transition-colors ${
                    !categoryFilter
                      ? "text-ash-black font-medium"
                      : "text-ash-gray-500 hover:text-ash-black"
                  }`}
                >
                  全部分類
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.id}`}
                    className={`block text-[13px] py-1 transition-colors ${
                      categoryFilter === cat.id
                        ? "text-ash-black font-medium"
                        : "text-ash-gray-500 hover:text-ash-black"
                    }`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 mb-4">排序</h3>
            <Suspense
              fallback={
                <select className="w-full bg-transparent border-b border-ash-gray-300 pb-2.5 text-xs outline-none" disabled>
                  <option>載入中...</option>
                </select>
              }
            >
              <SortSelect />
            </Suspense>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-6xl mb-4 opacity-30">🔍</p>
              <p className="text-ash-gray-500 text-sm">沒有找到相關商品</p>
              <Link href="/products" className="text-[11px] tracking-wider uppercase text-ash-black underline mt-4 inline-block hover:opacity-60">
                清除篩選
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-16">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams();
                    if (search) params.set("search", search);
                    if (categoryFilter) params.set("category", categoryFilter);
                    if (sort !== "newest") params.set("sort", sort);
                    if (p > 1) params.set("page", String(p));
                    const qs = params.toString();
                    return (
                      <a
                        key={p}
                        href={`/products${qs ? `?${qs}` : ""}`}
                        className={`w-9 h-9 flex items-center justify-center text-xs ${
                          page === p
                            ? "bg-ash-black text-white"
                            : "border border-ash-gray-200 hover:border-ash-black transition-colors"
                        }`}
                      >
                        {p}
                      </a>
                    );
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
