import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatTWD } from "@/lib/format";
import { generateMetadata as seo } from "@/lib/seo";
import { safeParse } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import type { Metadata } from "next";

interface ProductDetailProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return seo({ title: "商品不存在", noIndex: true });
  return seo({ title: product.name, description: product.description.slice(0, 160) });
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product) notFound();

  const images = safeParse<string[]>(product.images, []);
  const specs = safeParse<Record<string, string> | null>(product.specs, null) as Record<string, string> | null;
  const tags = safeParse<string[]>(product.tags, []);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <nav className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 mb-10">
        <Link href="/" className="hover:text-ash-black transition-colors">HOME</Link>
        <span className="mx-3">/</span>
        <Link href={`/categories/${product.category.slug}`} className="hover:text-ash-black transition-colors">{product.category.name}</Link>
        <span className="mx-3">/</span>
        <span className="text-ash-black">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery — Swiper 轮播 + 点击放大 */}
        <ProductGallery images={images} productName={product.name} />

        {/* Info */}
        <div className="lg:sticky lg:top-24 self-start">
          {product.brand && <p className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-400 mb-3">{product.brand}</p>}
          <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{product.name}</h1>
          <div className="mt-6 flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-xl text-ash-gray-400 line-through">{formatTWD(product.comparePrice!)}</span>
                <span className="text-2xl font-bold">{formatTWD(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold">{formatTWD(product.price)}</span>
            )}
          </div>
          <div className="mt-4"><span className="text-[11px]">{product.stock > 0 ? "✓ 有現貨" : "暫時缺貨"}</span></div>
          <div className="mt-8 pt-8 border-t border-ash-gray-100">
            <p className="text-sm text-ash-gray-600 leading-relaxed">{product.description}</p>
          </div>
          {specs && (
            <table className="w-full text-[13px] mt-6">
              <tbody>{Object.entries(specs).map(([k, v], i) => <tr key={k} className={i > 0 ? "border-t border-ash-gray-100" : ""}><td className="py-2.5 text-ash-gray-500 w-1/3">{k}</td><td className="py-2.5">{v}</td></tr>)}</tbody>
            </table>
          )}
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">{tags.map((tag: string) => <span key={tag} className="text-[10px] tracking-wider uppercase bg-ash-gray-50 px-2.5 py-1 text-ash-gray-500">{tag}</span>)}</div>
          )}
          <div className="mt-10 pt-8 border-t border-ash-gray-100">
            <AddToCartButton product={{ id: product.id, productId: product.id, name: product.name, price: product.price, image: images[0] || "", stock: product.stock }} />
          </div>
        </div>
      </div>
    </div>
  );
}
