"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatTWD } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderActions } from "@/components/admin/OrderActions";
import { Eye, RefreshCw } from "lucide-react";

function extractLineId(note: string): string {
  const i = note.indexOf("LINE:");
  if (i < 0) return "—";
  const after = note.slice(i + 5);
  const bar = after.indexOf("|");
  return (bar >= 0 ? after.slice(0, bar) : after).trim();
}

function formatDateTime(ts: string): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}:${s}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        setLastFetch(formatDateTime(new Date().toISOString()));
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  // 首次加载 + 每 5 秒自动刷新
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">訂單管理</h1>
          <p className="text-[13px] text-ash-gray-400 mt-0.5">
            {orders.length} 筆訂單
            {lastFetch && (
              <span className="ml-2 text-[10px] text-ash-gray-300">
                上次更新 {lastFetch}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-ash-gray-500 hover:text-ash-black px-4 py-2 border border-ash-gray-200 hover:border-ash-black transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          手動刷新
        </button>
      </div>

      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ash-gray-50 bg-ash-gray-50/50">
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">訂單編號</th>
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">客戶 / 手機</th>
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">地址</th>
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">LINE</th>
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">金額</th>
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">時間</th>
              <th className="text-left px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">狀態</th>
              <th className="text-right px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => {
              const lineId = extractLineId(o.note || "");
              return (
                <tr key={o.id} className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors">
                  <td className="px-4 py-4"><Link href={`/admin/orders/${o.id}`} className="text-[13px] font-mono font-medium hover:text-ash-gray-600">{o.orderNo}</Link></td>
                  <td className="px-4 py-4"><p className="text-[13px] font-medium">{o.recipientName}</p><p className="text-[11px] text-ash-gray-400">{o.recipientPhone}</p></td>
                  <td className="px-4 py-4"><p className="text-[12px] text-ash-gray-600 max-w-[180px] truncate">{o.shippingAddress}</p></td>
                  <td className="px-4 py-4"><p className="text-[12px] text-green-600 font-medium truncate max-w-[120px]">{lineId}</p></td>
                  <td className="px-4 py-4 text-[13px] font-bold">{formatTWD(Number(o.totalAmount))}</td>
                  <td className="px-4 py-4 text-[11px] text-ash-gray-500 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-medium rounded-full ${
                      o.status === "paid" || o.status === "delivered" ? "bg-green-50 text-green-700" :
                      o.status === "cancelled" ? "bg-red-50 text-red-600" :
                      o.status === "processing" || o.status === "shipped" ? "bg-blue-50 text-blue-700" :
                      "bg-ash-gray-100 text-ash-gray-600"}`}>{ORDER_STATUS_LABELS[o.status] || o.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/orders/${o.id}`} className="p-2 hover:bg-ash-gray-50 rounded-lg"><Eye className="h-3.5 w-3.5"/></Link>
                      <OrderActions orderId={o.id} currentStatus={o.status}/>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && orders.length === 0 && <tr><td colSpan={8} className="px-5 py-16 text-center text-[13px] text-ash-gray-300">尚無訂單</td></tr>}
            {loading && orders.length === 0 && <tr><td colSpan={8} className="px-5 py-16 text-center text-[13px] text-ash-gray-300"><RefreshCw className="h-4 w-4 inline animate-spin mr-2"/>載入中...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
