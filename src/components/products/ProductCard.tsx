"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatTWD } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const images = (() => { try { return JSON.parse(product.images || "[]"); } catch { return []; } })() as string[];
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const [imgLoaded, setImgLoaded] = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({ productId: product.id, name: product.name, price: product.price, image: images[0]||"", stock: product.stock, quantity: 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="group/card"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-ash-gray-100 overflow-hidden mb-4">
          {/* Skeleton */}
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-ash-gray-100" />}

          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/card:scale-110">🏌️</div>
          )}

          {/* SALE badge */}
          {hasDiscount && (
            <span className="absolute top-0 left-0 bg-ash-black text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 z-10">
              SALE
            </span>
          )}

          {/* Premium hover layer */}
          <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-all duration-500 ease-out">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Bottom actions */}
            <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="flex items-center justify-center gap-2 bg-white text-ash-black text-[11px] tracking-[0.12em] uppercase py-3 font-bold shadow-xl cursor-pointer hover:bg-ash-gray-50 transition-all duration-200 active:scale-[0.98]"
              >
                <Eye className="h-3.5 w-3.5" /> 查看詳情
              </motion.div>

              <motion.button
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onClick={quickAdd}
                disabled={product.stock <= 0}
                className="flex items-center justify-center gap-2 w-full bg-white/20 backdrop-blur border border-white/30 text-white text-[10px] tracking-[0.12em] uppercase py-2.5 font-medium hover:bg-white/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-3 w-3" /> 快速加入購物車
              </motion.button>
            </div>
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs tracking-[0.2em] uppercase font-bold bg-black/60 px-4 py-2">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-0.5">
          {product.brand && (
            <p className="text-[9px] tracking-[0.18em] uppercase text-ash-gray-400 mb-1.5 font-medium">
              {product.brand}
            </p>
          )}
          <h3 className="text-[13px] font-medium text-ash-black leading-[1.5] line-clamp-2 group-hover/card:text-ash-gray-600 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2.5 mt-2.5">
            {hasDiscount ? (
              <>
                <span className="text-[11px] text-ash-gray-400 line-through font-medium">
                  {formatTWD(product.comparePrice!)}
                </span>
                <span className="text-[13px] font-bold text-ash-black">
                  {formatTWD(product.price)}
                </span>
                <span className="text-[10px] text-red-600 font-medium ml-auto">
                  -{Math.round((1 - product.price / product.comparePrice!) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-[13px] font-bold text-ash-black">
                {formatTWD(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
