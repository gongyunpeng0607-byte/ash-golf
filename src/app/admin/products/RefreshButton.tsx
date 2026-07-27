"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.refresh()}
      className="p-2 border border-ash-gray-200 hover:border-ash-black transition-colors"
      title="重新整理"
    >
      <RefreshCw className="h-3.5 w-3.5" />
    </button>
  );
}
