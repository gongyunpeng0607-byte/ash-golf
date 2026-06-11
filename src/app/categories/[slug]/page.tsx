import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/turso-db";
import { ProductCard } from "@/components/products/ProductCard";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "分類不存在" };
  return { title: `${category.name} | ASH GOLF`, description: category.description as string };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug) as any;
  if (!category) notFound();

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <nav className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 mb-8">
        <Link href="/" className="hover:text-ash-black">HOME</Link><span className="mx-3">/</span><span className="text-ash-black">{category.name}</span>
      </nav>
      <h1 className="text-2xl lg:text-3xl font-bold mb-2 tracking-tight">{category.name}</h1>
      {category.description && <p className="text-sm text-ash-gray-500 mb-10">{category.description}</p>}
      {category.products?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {category.products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-ash-gray-400">暫無商品</div>
      )}
    </div>
  );
}
