"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CARDS = [
  {
    title: "高爾夫球桿",
    href: "/categories/golf-clubs",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* 球桿桿頭 (driver) */}
        <ellipse cx="40" cy="55" rx="20" ry="10" fill="#2a2a2a" />
        <ellipse cx="40" cy="55" rx="20" ry="10" fill="none" stroke="#111" strokeWidth="1.5" />
        {/* 桿面 */}
        <path d="M22 52 Q22 62 40 62 Q58 62 58 52" fill="#333" stroke="#222" strokeWidth="1" />
        {/* 桿身 */}
        <line x1="40" y1="45" x2="40" y2="18" stroke="#555" strokeWidth="3" strokeLinecap="round" />
        {/* 握把 */}
        <rect x="37" y="12" width="6" height="8" rx="3" fill="#1a1a1a" />
        {/* 桿面線條 */}
        <line x1="30" y1="56" x2="30" y2="59" stroke="#444" strokeWidth="1" />
        <line x1="35" y1="57" x2="35" y2="60" stroke="#444" strokeWidth="1" />
        <line x1="40" y1="58" x2="40" y2="61" stroke="#444" strokeWidth="1" />
        <line x1="45" y1="57" x2="45" y2="60" stroke="#444" strokeWidth="1" />
        <line x1="50" y1="56" x2="50" y2="59" stroke="#444" strokeWidth="1" />
        {/* 高爾夫球座 */}
        <line x1="58" y1="62" x2="58" y2="48" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="58" cy="47" r="2" fill="#fff" stroke="#ddd" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    title: "高爾夫服飾",
    href: "/categories/golf-apparel",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* Polo 衫 */}
        {/* 衣領 */}
        <path d="M28 28 L38 36 L42 36 L52 28" fill="#222" stroke="#111" strokeWidth="1.5" />
        {/* 左領尖 */}
        <path d="M28 28 L24 24 L34 26 Z" fill="#2a2a2a" />
        {/* 右領尖 */}
        <path d="M52 28 L56 24 L46 26 Z" fill="#2a2a2a" />
        {/* 領口鈕扣 */}
        <circle cx="40" cy="35" r="1.5" fill="#555" />
        {/* 衣身 */}
        <path d="M24 28 Q20 30 21 50 L28 66 L40 68 L52 66 L59 50 Q60 30 56 28" fill="#1a1a1a" />
        {/* 左袖 */}
        <path d="M21 30 Q12 34 14 48 Q16 50 24 42" fill="#222" stroke="#111" strokeWidth="1" />
        {/* 右袖 */}
        <path d="M59 30 Q68 34 66 48 Q64 50 56 42" fill="#222" stroke="#111" strokeWidth="1" />
        {/* 鈕扣排 */}
        <circle cx="40" cy="44" r="1.2" fill="#444" />
        <circle cx="40" cy="50" r="1.2" fill="#444" />
        <circle cx="40" cy="56" r="1.2" fill="#444" />
        {/* 品牌標 */}
        <rect x="35" y="38" width="10" height="4" rx="1" fill="#333" />
      </svg>
    ),
  },
  {
    title: "高爾夫球",
    href: "/categories/golf-balls",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* 球體 */}
        <circle cx="40" cy="40" r="22" fill="#f5f5f5" stroke="#ddd" strokeWidth="1.5" />
        {/* 高光 */}
        <ellipse cx="33" cy="31" rx="5" ry="3.5" fill="#fff" opacity="0.9" />
        {/* 凹痕網格 */}
        <circle cx="40" cy="40" r="18" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="12" fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="6" fill="none" stroke="#e8e8e8" strokeWidth="0.5" />
        {/* 球面凹痕網格 */}
        {[
          [30,28],[35,28],[40,28],[45,28],[50,28],
          [28,32],[33,32],[38,32],[43,32],[48,32],[52,32],
          [27,36],[32,36],[37,36],[42,36],[47,36],[53,36],
          [28,40],[33,40],[38,40],[42,40],[47,40],[52,40],
          [27,44],[32,44],[37,44],[42,44],[47,44],[53,44],
          [28,48],[33,48],[38,48],[43,48],[48,48],[52,48],
          [30,52],[35,52],[40,52],[45,52],[50,52],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.8" fill="#e0e0e0" />
        ))}
        {/* 品牌標記 */}
        <text x="40" y="43" textAnchor="middle" fontSize="5" fill="#999" fontWeight="bold">GOLF</text>
        {/* 地面陰影 */}
        <ellipse cx="40" cy="66" rx="16" ry="4" fill="#000" opacity="0.08" />
      </svg>
    ),
  },
  {
    title: "球袋",
    href: "/categories/golf-bags",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* 包包主體 */}
        <rect x="24" y="30" width="32" height="38" rx="6" fill="#2a2a2a" />
        {/* 包口 */}
        <ellipse cx="40" cy="30" rx="16" ry="5" fill="#1a1a1a" />
        <ellipse cx="40" cy="30" rx="14" ry="3.5" fill="#222" />
        {/* 隔層 */}
        <line x1="40" y1="26" x2="40" y2="33" stroke="#333" strokeWidth="1.5" />
        {/* 球桿從包口露出 */}
        <line x1="32" y1="28" x2="30" y2="8" stroke="#666" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="26" x2="35" y2="6" stroke="#777" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="25" x2="40" y2="4" stroke="#666" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="26" x2="45" y2="5" stroke="#888" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="28" x2="50" y2="9" stroke="#777" strokeWidth="2.5" strokeLinecap="round" />
        {/* 握把頂端 */}
        <rect x="29" y="5" width="3" height="4" rx="1.5" fill="#111" />
        <rect x="34" y="3" width="2.5" height="4" rx="1.5" fill="#111" />
        <rect x="39" y="1" width="3" height="4" rx="1.5" fill="#111" />
        <rect x="44" y="2" width="2.5" height="4" rx="1.5" fill="#111" />
        <rect x="49" y="6" width="3" height="4" rx="1.5" fill="#111" />
        {/* 側袋 */}
        <rect x="15" y="42" width="10" height="14" rx="3" fill="#252525" />
        <rect x="55" y="38" width="10" height="16" rx="3" fill="#252525" />
        {/* 揹帶 */}
        <path d="M26 34 Q22 25 28 22 Q36 18 36 32" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M54 34 Q58 25 52 22 Q44 18 44 32" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
        {/* 品牌標 */}
        <rect x="33" y="50" width="14" height="5" rx="2" fill="#444" />
        {/* 底部 */}
        <rect x="22" y="63" width="36" height="4" rx="2" fill="#111" />
      </svg>
    ),
  },
  {
    title: "手套",
    href: "/categories/golf-gloves",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* 手套本體 */}
        {/* 手掌部分 */}
        <path d="M26 32 Q22 36 22 46 L24 60 Q26 66 32 66 L48 66 Q54 66 56 60 L58 46 Q58 36 54 32" fill="#f0ede8" stroke="#ddd" strokeWidth="1.5" />
        {/* 大拇指 */}
        <path d="M26 32 Q18 28 16 36 Q14 44 22 44" fill="#f5f2ed" stroke="#ddd" strokeWidth="1.5" />
        {/* 食指 */}
        <path d="M28 22 Q26 14 30 12 Q34 10 34 18 L34 32" fill="#f0ede8" stroke="#ddd" strokeWidth="1.5" />
        {/* 中指 */}
        <path d="M34 18 Q34 8 38 6 Q42 4 42 14 L42 32" fill="#f0ede8" stroke="#ddd" strokeWidth="1.5" />
        {/* 無名指 */}
        <path d="M42 18 Q42 10 46 8 Q50 6 50 16 L50 32" fill="#f0ede8" stroke="#ddd" strokeWidth="1.5" />
        {/* 小指 */}
        <path d="M50 22 Q52 14 55 14 Q58 14 56 22 L56 32" fill="#e8e4df" stroke="#ddd" strokeWidth="1.5" />
        {/* 手腕帶 */}
        <rect x="20" y="60" width="40" height="8" rx="3" fill="#1a1a1a" />
        <line x1="40" y1="62" x2="40" y2="66" stroke="#444" strokeWidth="0.8" />
        {/* Velcro 扣環 */}
        <rect x="36" y="58" width="8" height="4" rx="2" fill="#2a2a2a" />
        {/* 手背紋理 */}
        <path d="M32 44 L36 44" stroke="#e0ddd6" strokeWidth="1" strokeLinecap="round" />
        <path d="M32 48 L38 48" stroke="#e0ddd6" strokeWidth="1" strokeLinecap="round" />
        <path d="M30 52 L44 52" stroke="#e0ddd6" strokeWidth="1" strokeLinecap="round" />
        {/* 品牌標 */}
        <rect x="32" y="38" width="16" height="4" rx="1.5" fill="#d5d0c8" />
      </svg>
    ),
  },
  {
    title: "配件",
    href: "/categories/golf-accessories",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        {/* 球座 */}
        <line x1="18" y1="48" x2="18" y2="26" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="25" r="3" fill="#fff" stroke="#ddd" strokeWidth="0.8" />
        {/* 測距儀 */}
        <rect x="36" y="32" width="24" height="20" rx="4" fill="#1a1a1a" />
        <rect x="40" y="36" width="16" height="12" rx="2" fill="#333" />
        <circle cx="44" cy="42" r="2.5" fill="#2a5aa0" />
        <circle cx="44" cy="42" r="1" fill="#5a8ad0" />
        <circle cx="52" cy="36" r="1.5" fill="#111" />
        {/* 標籤 */}
        <text x="44" y="57" fontSize="3.5" fill="#666" textAnchor="middle">YARD</text>
        {/* 帽子 */}
        <path d="M56 26 Q62 24 66 28 L68 38 Q68 44 62 44 L58 44 Q56 44 56 40 Z" fill="#1a1a1a" />
        <ellipse cx="62" cy="28" rx="8" ry="4" fill="#222" />
        <path d="M56 40 Q54 42 54 44" stroke="#222" strokeWidth="1.5" />
        {/* 記分卡 */}
        <rect x="26" y="52" width="20" height="14" rx="2" fill="#f5f0e8" stroke="#ddd" strokeWidth="0.8" transform="rotate(-8 36 59)" />
        <line x1="30" y1="56" x2="42" y2="55" stroke="#ccc" strokeWidth="0.5" transform="rotate(-8 36 59)" />
        <line x1="30" y1="59" x2="42" y2="58" stroke="#ccc" strokeWidth="0.5" transform="rotate(-8 36 59)" />
        <line x1="30" y1="62" x2="42" y2="61" stroke="#ccc" strokeWidth="0.5" transform="rotate(-8 36 59)" />
        {/* 鉛筆 */}
        <line x1="44" y1="56" x2="52" y2="46" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 36 59)" />
      </svg>
    ),
  },
];

export function CategoryGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {CARDS.map((cat) => (
          <motion.div
            key={cat.href}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            <Link
              href={cat.href}
              className="group block relative aspect-[4/5] bg-gradient-to-b from-white to-ash-gray-100 overflow-hidden rounded-lg border border-ash-gray-100 hover:border-ash-gray-300 transition-all duration-300"
            >
              {/* 插圖區域 */}
              <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-105">
                <div className="w-16 h-16">
                  {cat.svg}
                </div>
              </div>
              {/* Hover 遮罩 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              {/* 標籤 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ash-gray-100/90 to-transparent pt-10">
                <h3 className="text-[13px] font-bold text-ash-black group-hover:text-ash-black/80 transition-colors tracking-wide">
                  {cat.title}
                </h3>
              </div>
              {/* 懸浮指示線 */}
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-ash-black scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
