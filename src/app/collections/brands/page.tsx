import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRANDS 品牌總覽 | ASH GOLF",
  description: "ASH GOLF 精選全球頂級高爾夫品牌",
};

const BRANDS = [
  { name: "TAYLORMADE", logo: "🏌️", desc: "專業高爾夫球具領導品牌" },
  { name: "TITLEIST", logo: "⛳", desc: "巡迴賽最受信賴的高爾夫品牌" },
  { name: "CALLAWAY", logo: "🏌️‍♂️", desc: "創新科技驅動的球具品牌" },
  { name: "PING", logo: "🏌️", desc: "經典工藝與設計的品牌" },
  { name: "SCOTTY CAMERON", logo: "🎯", desc: "世界最精緻的推桿品牌" },
  { name: "FOOTJOY", logo: "🧤", desc: "高爾夫手套與鞋類第一品牌" },
  { name: "NIKE GOLF", logo: "👕", desc: "運動時尚高爾夫服飾" },
  { name: "BUSHNELL", logo: "🔭", desc: "專業高爾夫測距儀品牌" },
  { name: "BOSS GOLF", logo: "👔", desc: "德國時尚高爾夫服飾" },
  { name: "G/FORE", logo: "🧤", desc: "時尚潮流高爾夫品牌" },
  { name: "SUN DAY RED", logo: "🐅", desc: "Tiger Woods 高爾夫服飾" },
  { name: "DESCENTE", logo: "🇯🇵", desc: "日本高性能高爾夫服飾" },
];

export default function BrandsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ash-gray-400 mb-3">OUR BRANDS</p>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">品牌總覽</h1>
        <p className="text-sm text-ash-gray-500">精選全球頂級高爾夫品牌 · 正品保證</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BRANDS.map(brand => (
          <Link
            key={brand.name}
            href={`/products?search=${encodeURIComponent(brand.name)}`}
            className="group block border border-ash-gray-100 p-8 text-center hover:border-ash-black transition-all duration-300 hover:shadow-sm"
          >
            <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">{brand.logo}</span>
            <h3 className="text-sm font-bold tracking-wider">{brand.name}</h3>
            <p className="text-[11px] text-ash-gray-400 mt-2">{brand.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
