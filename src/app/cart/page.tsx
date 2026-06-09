"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatTWD } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const cartSubtotal = subtotal();
  const isFreeShipping = cartSubtotal >= 3000;
  const shippingFee = isFreeShipping ? 0 : 100;
  const total = cartSubtotal + shippingFee;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 min-h-[60vh]">
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32"
        >
          <ShoppingCart className="h-12 w-12 mx-auto mb-6 text-ash-gray-200" />
          <p className="text-sm text-ash-gray-500 mb-8">購物車是空的</p>
          <Link href="/products">
            <button className="bg-ash-black text-white text-xs tracking-[0.2em] uppercase px-12 py-4 font-bold hover:bg-ash-gray-800 transition-colors">
              開始購物
            </button>
          </Link>
        </motion.div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-xl font-bold text-ash-black tracking-tight">
              購物車 ({items.length})
            </h1>
            <button
              className="text-[11px] tracking-wider uppercase text-ash-gray-400 hover:text-red-500 transition-colors"
              onClick={clearCart}
            >
              清空購物車
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-1">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-6 py-6 border-b border-ash-gray-100"
                  >
                    <div className="w-24 h-32 bg-ash-gray-50 flex items-center justify-center text-3xl shrink-0">
                      🏌️
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-medium leading-snug">{item.name}</h3>
                      <p className="text-[13px] font-bold text-ash-black mt-1">{formatTWD(item.price)}</p>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-ash-gray-200">
                          <button
                            className="px-3 py-2 hover:bg-ash-gray-50 text-xs"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="px-4 py-2 text-xs border-x border-ash-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            className="px-3 py-2 hover:bg-ash-gray-50 text-xs"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <button
                          className="text-ash-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold">{formatTWD(item.price * item.quantity)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link href="/products" className="inline-block mt-8 text-[11px] tracking-wider uppercase text-ash-gray-500 hover:text-ash-black transition-colors">
                ← 繼續購物
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-ash-gray-50 p-8 sticky top-24">
                <h3 className="text-sm tracking-wider uppercase font-bold mb-6">訂單摘要</h3>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-ash-gray-500">商品小計</span>
                    <span>{formatTWD(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ash-gray-500">運費</span>
                    <span>{isFreeShipping ? "免運費" : formatTWD(shippingFee)}</span>
                  </div>
                  {!isFreeShipping && (
                    <p className="text-[11px] text-ash-gray-400">
                      還差 {formatTWD(3000 - cartSubtotal)} 享有免運費
                    </p>
                  )}
                  <hr className="border-ash-gray-200" />
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>總計</span>
                    <span>{formatTWD(total)}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <button className="w-full bg-ash-black text-white text-xs tracking-[0.2em] uppercase py-5 font-bold hover:bg-ash-gray-800 transition-colors mt-6">
                    前往結帳
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
