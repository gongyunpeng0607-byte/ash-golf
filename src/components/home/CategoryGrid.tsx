"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CARDS = [
  { title: "高爾夫球桿", href: "/categories/golf-clubs", image: "🏌️" },
  { title: "高爾夫服飾", href: "/categories/golf-apparel", image: "👕" },
  { title: "高爾夫球", href: "/categories/golf-balls", image: "⚪" },
  { title: "球袋", href: "/categories/golf-bags", image: "🎒" },
  { title: "手套", href: "/categories/golf-gloves", image: "🧤" },
  { title: "配件", href: "/categories/golf-accessories", image: "🧢" },
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
            <Link href={cat.href} className="group block relative aspect-[3/4] bg-ash-gray-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-6xl transition-transform duration-700 group-hover:scale-110">
                {cat.image}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-sm font-bold text-ash-black group-hover:text-ash-black/80 transition-colors">{cat.title}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
