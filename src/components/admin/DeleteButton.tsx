"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    router.refresh();
  };

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="刪除">
        <Trash2 className="h-3.5 w-3.5 text-red-400" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={handleDelete} className="px-2.5 py-1.5 text-[10px] tracking-wider uppercase bg-red-600 text-white rounded hover:bg-red-700 transition-colors">確認刪除</button>
      <button onClick={() => setConfirm(false)} className="px-2.5 py-1.5 text-[10px] tracking-wider uppercase border border-ash-gray-200 rounded hover:bg-ash-gray-50 transition-colors">取消</button>
    </div>
  );
}
