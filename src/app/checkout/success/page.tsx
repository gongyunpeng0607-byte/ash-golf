"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get("orderNo") || "————";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-lg mx-auto text-center py-24 px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="h-16 w-16 mx-auto text-ash-black" />
      </motion.div>

      <h1 className="text-2xl font-bold mt-8 tracking-tight">THANK YOU</h1>
      <p className="text-sm text-ash-gray-500 mt-3">感謝您的訂購，我們將盡快處理</p>

      <div className="bg-ash-gray-50 p-8 mt-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-ash-gray-400">訂單編號</p>
        <p className="text-lg font-bold text-ash-black mt-2 tracking-wider">{orderNo}</p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products">
          <button className="bg-ash-black text-white text-xs tracking-[0.2em] uppercase px-10 py-4 font-bold hover:bg-ash-gray-800 transition-colors w-full sm:w-auto">
            繼續購物
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto text-center py-24"><div className="animate-pulse h-16 w-16 bg-ash-gray-100 rounded-full mx-auto" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
