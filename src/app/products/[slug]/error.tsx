"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function ProductDetailError() {
  return <ErrorFallback message="商品詳情載入失敗" />;
}
