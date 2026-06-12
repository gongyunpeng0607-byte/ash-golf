"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function AdminError() {
  return <ErrorFallback message="後台載入失敗" />;
}
