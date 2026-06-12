"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORY_CARDS = [
  { title: "高爾夫球桿", subtitle: "CLUBS", href: "/categories/golf-clubs", image: "🏌️" },
  { title: "高爾夫球", subtitle: "BALLS", href: "/categories/golf-balls", image: "⚪" },
  { title: "球袋", subtitle: "BAGS", href: "/categories/golf-bags", image: "🎒" },
  { title: "手套", subtitle: "GLOVES", href: "/categories/golf-gloves", image: "🧤" },
  { title: "配件", subtitle: "ACCESSORIES", href: "/categories/golf-accessories", image: "🧢" },
];

export function CategoryGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {CATEGORY_CARDS.map((cat, i) => (
          <motion.div
            key={cat.href}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <Link
              href={cat.href}
              className="group block relative aspect-[3/4] bg-ash-gray-100 overflow-hidden"
            >
              {/* Image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center text-7xl transition-transform duration-700 group-hover:scale-110">
                {cat.image}
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-500 mb-1">
                  {cat.subtitle}
                </p>
                <h3 className="text-lg font-bold text-ash-black group-hover:text-ash-black/80 transition-colors">
                  {cat.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
