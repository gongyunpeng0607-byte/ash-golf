"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatTWD } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCartStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-ash-gray-100">
              <h2 className="text-sm tracking-wider uppercase font-bold flex items-center gap-2">
                購物車
                {items.length > 0 && (
                  <span className="text-ash-gray-400 font-normal">({totalItems()})</span>
                )}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-ash-gray-50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-4 text-ash-gray-200" />
                  <p className="text-sm text-ash-gray-500">購物車是空的</p>
                  <Link
                    href="/products"
                    className="text-[11px] tracking-wider uppercase text-ash-black underline mt-4 inline-block hover:opacity-60"
                    onClick={onClose}
                  >
                    開始購物
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 pb-5 border-b border-ash-gray-100"
                      >
                        <div className="w-20 h-24 bg-ash-gray-50 flex items-center justify-center text-2xl shrink-0">
                          🏌️
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-medium leading-snug line-clamp-2">{item.name}</h3>
                          <p className="text-[13px] font-bold text-ash-black mt-1">{formatTWD(item.price)}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-ash-gray-200">
                              <button
                                className="px-2.5 py-1.5 text-xs hover:bg-ash-gray-50 transition-colors"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="px-3 py-1.5 text-xs border-x border-ash-gray-200">{item.quantity}</span>
                              <button
                                className="px-2.5 py-1.5 text-xs hover:bg-ash-gray-50 transition-colors"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <button
                              className="text-ash-gray-400 hover:text-red-500 transition-colors ml-auto"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-ash-gray-100 p-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ash-gray-500">小計</span>
                  <span className="font-bold">{formatTWD(subtotal())}</span>
                </div>
                <p className="text-[11px] text-ash-gray-400 mb-5">運費將在結帳時計算</p>
                <Link href="/cart" onClick={onClose}>
                  <button className="w-full bg-ash-black text-white text-xs tracking-widest uppercase py-4 hover:bg-ash-gray-800 transition-colors font-bold">
                    查看購物車
                  </button>
                </Link>
                <Link href="/checkout" onClick={onClose}>
                  <button className="w-full border border-ash-black text-ash-black text-xs tracking-widest uppercase py-4 hover:bg-ash-black hover:text-white transition-colors font-bold mt-2">
                    直接結帳
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
