"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function GlobalError() {
  return <ErrorFallback message="頁面載入失敗" />;
}
