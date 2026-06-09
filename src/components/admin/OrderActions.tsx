"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        paymentStatus: newStatus === "paid" ? "paid" : undefined,
      }),
    });
    router.refresh();
  };

  const statusFlow: Record<string, string[]> = {
    pending: ["paid"],
    paid: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const nextStatuses = statusFlow[currentStatus] || [];

  return (
    <div className="flex items-center justify-end gap-1">
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => updateStatus(status)}
          className="text-[11px] tracking-wider uppercase text-ash-gray-500 hover:text-ash-black px-2 py-1 transition-colors"
        >
          → {ORDER_STATUS_LABELS[status] || status}
        </button>
      ))}
    </div>
  );
}
