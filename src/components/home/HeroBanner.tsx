"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-ash-black">
      {/* Main container */}
      <div className="relative max-w-[1440px] mx-auto">
        {/* Two-column editorial layout */}
        <div className="grid lg:grid-cols-2 min-h-[85vh]">
          {/* Left: Brand statement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center px-6 lg:px-16 py-16 lg:py-0 order-2 lg:order-1 bg-ash-black"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-6"
            >
              ONLY THE BEST
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight"
            >
              為每一桿
              <br />
              做好準備
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 text-sm text-white/50 max-w-sm leading-relaxed"
            >
              精選全球頂級高爾夫品牌，從球場到日常，重新定義高爾夫時尚。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link href="/collections/new">
                <Button className="bg-white text-black hover:bg-white/90 text-xs tracking-[0.2em] uppercase px-10 py-5 rounded-none font-bold">
                  立即探索
                </Button>
              </Link>
              <Link href="/collections/brands">
                <Button className="border border-white/20 text-white hover:bg-white/10 text-xs tracking-[0.2em] uppercase px-10 py-5 rounded-none font-bold bg-transparent">
                  品牌總覽
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Full-bleed image area */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative order-1 lg:order-2 min-h-[45vh] lg:min-h-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#111] flex items-center justify-center overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-white/20" />
              <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full border border-white/10" />
            </div>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 text-center"
            >
              <span className="text-[160px] lg:text-[200px] opacity-90 select-none">⛳</span>
              <p className="text-white/30 text-xs tracking-[0.3em] uppercase mt-4">ASH GOLF</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
