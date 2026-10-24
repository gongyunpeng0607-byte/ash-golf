"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flag, Shirt, CircleDot, Backpack, Hand, Package } from "lucide-react";

const CARDS = [
  { title: "高爾夫球桿", href: "/categories/golf-clubs", Icon: Flag },
  { title: "高爾夫服飾", href: "/categories/golf-apparel", Icon: Shirt },
  { title: "高爾夫球", href: "/categories/golf-balls", Icon: CircleDot },
  { title: "球袋", href: "/categories/golf-bags", Icon: Backpack },
  { title: "手套", href: "/categories/golf-gloves", Icon: Hand },
  { title: "配件", href: "/categories/golf-accessories", Icon: Package },
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
            <Link href={cat.href} className="group block relative aspect-[3/4] bg-ash-gray-50 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <cat.Icon className="h-9 w-9 text-ash-gray-700 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.25} />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
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
