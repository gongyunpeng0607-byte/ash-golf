"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, User, Heart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/collections/new", label: "New" },
  { href: "/products", label: "全部" },
  { href: "/categories/golf-clubs", label: "球具" },
  { href: "/categories/golf-balls", label: "球" },
  { href: "/categories/golf-accessories", label: "配件" },
  { href: "/collections/brands", label: "品牌" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const total = useCartStore(s => s.totalItems);
  const cartOpen = useCartStore(s => s.cartOpen);
  const setCartOpen = useCartStore(s => s.setCartOpen);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-ash-black text-white text-[10px] tracking-[0.2em] uppercase py-2 text-center overflow-hidden">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="whitespace-nowrap inline-flex gap-24">
          <span>免運 · 滿 NT$3,000</span><span>貨到付款</span><span>正品保證</span><span>LINE gyp</span>
          <span>免運 · 滿 NT$3,000</span><span>貨到付款</span><span>正品保證</span><span>LINE gyp</span>
        </motion.div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-ash-black backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[64px]">
          {/* Left nav */}
          <div className="flex items-center gap-5">
            <button className="lg:hidden p-2 -ml-2 text-white" onClick={() => setMenuOpen(true)}><Menu className="h-5 w-5" /></button>
            <nav className="hidden lg:flex items-center gap-6">
              {NAV.map(l => <Link key={l.href} href={l.href} className="text-[11px] tracking-[0.1em] uppercase text-white/70 hover:text-white transition-colors duration-200">{l.label}</Link>)}
            </nav>
          </div>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-lg tracking-[0.25em] font-bold text-white select-none">ASH GOLF</Link>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-white/70 hover:text-white transition-colors"><Search className="h-4 w-4" /></button>
            <Link href="/wishlist" className="hidden sm:block p-2 text-white/70 hover:text-white"><Heart className="h-4 w-4" /></Link>
            <Link href="/account" className="hidden sm:block p-2 text-white/70 hover:text-white"><User className="h-4 w-4" /></Link>
            <button onClick={() => setCartOpen(true)} className="p-2 text-white/70 hover:text-white relative">
              <ShoppingCart className="h-4 w-4" />
              {mounted && total() > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-white text-[9px] font-bold text-ash-black rounded-full">{total()}</span>}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/10">
              <form onSubmit={e => e.preventDefault()} className="max-w-[1440px] mx-auto px-6 lg:px-10 py-3">
                <input autoFocus className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/30 py-1" placeholder="搜尋商品..." onBlur={() => setSearchOpen(false)} />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
