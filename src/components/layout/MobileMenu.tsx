"use client";

import Link from "next/link";
import { X, User, Heart } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-ash-black text-white shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="text-lg tracking-[0.2em] font-bold">ASH GOLF</span>
              <button onClick={onClose} className="p-2 text-white/60 hover:text-white" aria-label="關閉">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-6 flex flex-col gap-1">
              <Link
                href="/collections/new"
                className="flex items-center px-3 py-3 text-sm tracking-wider uppercase text-white/70 hover:text-white"
                onClick={onClose}
              >
                新品上市
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="flex items-center px-3 py-3 text-sm tracking-wider uppercase text-white/70 hover:text-white"
                  onClick={onClose}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/collections/brands"
                className="flex items-center px-3 py-3 text-sm tracking-wider uppercase text-white/70 hover:text-white"
                onClick={onClose}
              >
                品牌總覽
              </Link>
              <hr className="my-4 border-white/10" />
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-3 text-sm text-white/60 hover:text-white"
                onClick={onClose}
              >
                <User className="h-4 w-4" /> 會員中心
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-3 py-3 text-sm text-white/60 hover:text-white"
                onClick={onClose}
              >
                <Heart className="h-4 w-4" /> 願望清單
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
