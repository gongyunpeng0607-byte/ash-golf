"use client";

import { motion } from "framer-motion";

export function BrandStory() {
  return (
    <section className="bg-ash-black text-white py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-8 right-8 w-32 h-32 rounded-full border border-white/10" />
            <div className="absolute bottom-12 left-12 w-24 h-24 rounded-full border border-white/10" />
            <div className="text-center relative z-10">
              <span className="text-[120px] opacity-50">⛳</span>
              <p className="text-xs tracking-[0.3em] uppercase text-white/30 mt-2">ASH GOLF</p>
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">
              ABOUT ASH GOLF
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              ONLY THE BEST
            </h2>
            <div className="mt-8 space-y-5 text-sm text-white/50 leading-relaxed">
              <p>
                ASH GOLF 成立於 2022 年，秉持「ONLY THE BEST」的品牌理念，
                致力於為台灣高爾夫愛好者引進全球最頂級的高爾夫品牌與商品。
              </p>
              <p>
                從 BOSS GOLF 到 SUN DAY RED，從專業球具到時尚服飾，
                我們相信高爾夫不僅是運動，更是一種生活態度。
              </p>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-10 border-t border-white/10 pt-10">
              {[
                { value: "20+", label: "國際品牌" },
                { value: "1000+", label: "精選商品" },
                { value: "100%", label: "正品保證" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] text-white/40 mt-1 tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
