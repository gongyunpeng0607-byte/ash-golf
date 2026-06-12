"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatTWD } from "@/lib/format";
import type { Product } from "@/types";

const GOLF_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%231a1a2e' width='400' height='500'/%3E%3Ctext fill='%23ffffff20' font-family='sans-serif' font-size='80' text-anchor='middle' x='200' y='260'%3E%E2%9B%B3%3C/text%3E%3C/svg%3E";

export function ProductCard({ product }: { product: Product }) {
  const images = (() => { try { return JSON.parse(product.images || "[]"); } catch { return []; } })() as string[];
  const img = images[0] || GOLF_PLACEHOLDER;
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
        {/* Image — 全宽显示，1:1.25 比例 */}
        <div className="relative aspect-[4/5] bg-[#1a1a2e] overflow-hidden mb-3">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-600 group-hover/card:scale-105"
            loading="lazy"
          />

          {hasDiscount && (
            <span className="absolute top-0 left-0 bg-white text-black text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 z-10 font-bold">SALE</span>
          )}

          {/* Hover — 半透明遮罩 + 查看详情 */}
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

        {/* Info */}
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
