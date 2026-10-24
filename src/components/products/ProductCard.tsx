"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { formatTWD } from "@/lib/format";
import { PLACEHOLDER_SVG } from "@/components/ui/PlaceholderImage";
import type { ProductCardData } from "@/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = product.cover || PLACEHOLDER_SVG;
  const hasDiscount = product.comparePrice != null && product.comparePrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group/card"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-ash-gray-50 overflow-hidden mb-3">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
            }}
          />

          {hasDiscount && (
            <span className="absolute top-0 left-0 bg-black text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 z-10 font-bold">SALE</span>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/card:opacity-100">
            <span className="flex items-center gap-2 bg-white text-black text-[11px] tracking-[0.1em] uppercase px-6 py-3 font-bold shadow-xl hover:bg-ash-gray-100 transition-colors">
              <Eye className="h-3.5 w-3.5" /> 查看詳情
            </span>
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs tracking-[0.2em] uppercase font-bold bg-black/70 px-4 py-2">SOLD OUT</span>
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-[9px] tracking-[0.15em] uppercase text-ash-gray-400 mb-1 font-medium">{product.brand}</p>
          )}
          <h3 className="text-[13px] font-medium text-black leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1.5">
            {hasDiscount ? (
              <>
                <span className="text-[11px] text-ash-gray-400 line-through">{formatTWD(product.comparePrice!)}</span>
                <span className="text-[13px] font-bold text-black">{formatTWD(product.price)}</span>
              </>
            ) : (
              <span className="text-[13px] font-bold text-black">{formatTWD(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
