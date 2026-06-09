import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight } from "lucide-react";

export async function FeaturedProducts() {
  const products = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-400 mb-3">FEATURED</p>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">熱門推薦</h2>
        </div>
        <Link href="/products" className="hidden sm:inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 hover:text-ash-black transition-colors">
          查看全部 <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
