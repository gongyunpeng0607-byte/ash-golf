import Link from "next/link";
import { getProducts } from "@/lib/turso-db";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight } from "lucide-react";

export async function HomeFeatured() {
  try {
    const result = await getProducts({ where: "isActive = 1 AND isFeatured = 1", take: 8, ttl: 60000 });
    if (!result.products?.length) return null;
    return (
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-400 mb-3">FEATURED</p>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">熱門推薦</h2>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 hover:text-ash-black">
            查看全部 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {result.products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    );
  } catch { return null; }
}
