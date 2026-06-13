export const dynamic = 'force-dynamic';
export const revalidate = 5;
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/turso-db";
import { formatTWD } from "@/lib/format";
import { safeParse } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import type { Metadata } from "next";

// @ts-nocheck

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "商品不存在" };
  return { title: `${product.name} | ASH GOLF`, description: (product.description as string)?.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as any;
  if (!product) notFound();

  const images = safeParse<string[]>(product.images as string, []);
  const specs = safeParse<Record<string, string> | null>(product.specs as string, null);
  const tags = safeParse<string[]>(product.tags as string, []);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const catSlug = product.category?.slug || product.categorySlug || "golf-clubs";

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <nav className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 mb-10">
        <Link href="/" className="hover:text-ash-black">HOME</Link><span className="mx-3">/</span>
        <Link href={`/categories/${catSlug}`} className="hover:text-ash-black">{product.category?.name || product.categoryName}</Link><span className="mx-3">/</span>
        <span className="text-ash-black">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={images} productName={product.name as string} />

        <div className="lg:sticky lg:top-24 self-start">
          {product.brand && <p className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-400 mb-3">{product.brand}</p>}
          <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{product.name}</h1>
          <div className="mt-6 flex items-baseline gap-3">
            {hasDiscount ? (<><span className="text-xl text-ash-gray-400 line-through">{formatTWD(product.comparePrice)}</span><span className="text-2xl font-bold">{formatTWD(product.price)}</span></>) : <span className="text-2xl font-bold">{formatTWD(product.price)}</span>}
          </div>
          <div className="mt-4"><span className="text-[11px]">{Number(product.stock) > 0 ? "✓ 有現貨" : "暫時缺貨"}</span></div>
          <div className="mt-8 pt-8 border-t border-ash-gray-100"><p className="text-sm text-ash-gray-600 leading-relaxed">{product.description}</p></div>
          {specs && <table className="w-full text-[13px] mt-6"><tbody>{Object.entries(specs).map(([k,v],i) => <tr key={k} className={i>0?"border-t border-ash-gray-100":""}><td className="py-2.5 text-ash-gray-500 w-1/3">{k}</td><td className="py-2.5">{v}</td></tr>)}</tbody></table>}
          {tags.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{tags.map(t => <span key={t} className="text-[10px] tracking-wider uppercase bg-ash-gray-50 px-2.5 py-1 text-ash-gray-500">{t}</span>)}</div>}
          <div className="mt-10 pt-8 border-t border-ash-gray-100">
            <AddToCartButton product={{ id: product.id as string, productId: product.id as string, name: product.name as string, price: Number(product.price), image: images[0]||"", stock: Number(product.stock) }} />
          </div>
        </div>
      </div>
    </div>
  );
}
