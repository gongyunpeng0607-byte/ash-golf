"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatTWD } from "@/lib/format";
import type { Product } from "@/types";

const GOLF_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a5632"/><stop offset="100%" style="stop-color:#0d331d"/></linearGradient></defs><rect fill="url(#g)" width="400" height="500"/><circle cx="200" cy="180" r="80" fill="none" stroke="white" stroke-width="1" opacity="0.15"/><text fill="white" font-family="sans-serif" font-size="100" text-anchor="middle" y="250">⛳</text><text fill="white" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" y="340">商品圖片</text><text fill="white" font-family="sans-serif" font-size="11" text-anchor="middle" y="365" opacity="0.5">即將更新</text></svg>`)}`;

function getFirstImage(images: string): string {
  if (!images || images === "[]") return "";
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      if (typeof first === "string" && first.length > 10) return first;
    }
  } catch {
    // JSON被截断，尝试提取第一个data:...到下一个引号
    const m = images.match(/data:image\/[^"]+/);
    if (m) return m[0];
  }
  return "";
}

export function ProductCard({ product }: { product: Product }) {
  const img = getFirstImage(product.images || "[]") || GOLF_PLACEHOLDER;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const addItem = useCartStore(s => s.addItem);

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({ productId: product.id, name: product.name, price: product.price, image: img, stock: product.stock, quantity: 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group/card"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-white overflow-hidden mb-3 border border-gray-100">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-600 group-hover/card:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = GOLF_PLACEHOLDER;
            }}
          />

          {hasDiscount && (
            <span className="absolute top-0 left-0 bg-black text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 z-10 font-bold">SALE</span>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-all duration-400 flex items-center justify-center opacity-0 group-hover/card:opacity-100">
            <span className="flex items-center gap-2 bg-white text-black text-[11px] tracking-[0.1em] uppercase px-6 py-3 font-bold shadow-xl hover:bg-gray-100 transition-colors">
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
            <p className="text-[9px] tracking-[0.15em] uppercase text-gray-400 mb-1 font-medium">{product.brand}</p>
          )}
          <h3 className="text-[13px] font-medium text-black leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1.5">
            {hasDiscount ? (
              <>
                <span className="text-[11px] text-gray-400 line-through">{formatTWD(product.comparePrice!)}</span>
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
