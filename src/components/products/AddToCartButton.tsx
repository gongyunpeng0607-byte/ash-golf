"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { motion, AnimatePresence } from "framer-motion";

interface AddToCartButtonProps {
  product: {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  onAdded?: () => void;
}

export function AddToCartButton({ product, onAdded }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({ ...product, quantity });
    setAdded(true);
    onAdded?.();
    setTimeout(() => setAdded(false), 1800);
  };

  if (product.stock === 0) {
    return (
      <button disabled className="w-full bg-ash-gray-200 text-ash-gray-400 text-xs tracking-[0.2em] uppercase py-5 font-bold cursor-not-allowed">
        暫時缺貨
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center border border-ash-gray-200 w-fit">
        <button className="px-4 py-3 hover:bg-ash-gray-50" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
          <Minus className="h-3 w-3" />
        </button>
        <span className="px-7 py-3 text-sm border-x border-ash-gray-200 min-w-[3rem] text-center">{quantity}</span>
        <button className="px-4 py-3 hover:bg-ash-gray-50" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <button onClick={handleAdd} className="w-full bg-ash-black text-white text-xs tracking-[0.2em] uppercase py-5 font-bold hover:bg-ash-gray-800 transition-colors relative overflow-hidden">
        <AnimatePresence mode="wait">
          {added ? (
            <motion.span key="ok" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="flex items-center justify-center gap-2">✓ 已加入購物車</motion.span>
          ) : (
            <motion.span key="add" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" /> 加入購物車
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
