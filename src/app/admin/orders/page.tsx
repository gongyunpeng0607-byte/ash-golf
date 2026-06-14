"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { formatTWD } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderActions } from "@/components/admin/OrderActions";
import { Eye, RefreshCw, Search, Download, X, Filter } from "lucide-react";

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

const STATUS_OPTIONS = ["", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState("");

  // 筛选 & 搜索
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?pageSize=200");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        setLastFetch(formatDateTime(new Date().toISOString()));
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // 筛选 & 搜索
  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !searchText
        || o.orderNo?.toLowerCase().includes(searchText.toLowerCase())
        || o.recipientName?.toLowerCase().includes(searchText.toLowerCase())
        || o.recipientPhone?.includes(searchText)
        || extractLineId(o.note || "").toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !statusFilter || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchText, statusFilter]);

  // 导出 CSV
  const handleExport = () => {
    const header = ["訂單編號", "客戶姓名", "手機", "地址", "LINE ID", "金額", "狀態", "時間", "備註"];
    const rows = filtered.map(o => [
      o.orderNo || "",
      o.recipientName || "",
      o.recipientPhone || "",
      o.shippingAddress || "",
      extractLineId(o.note || ""),
      o.totalAmount,
      ORDER_STATUS_LABELS[o.status] || o.status,
      formatDateTime(o.createdAt),
      (o.note || "").replace(/\|/g, " "),
    ]);

    const BOM = "﻿";
    const csv = BOM + [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => { setSearchText(""); setStatusFilter(""); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">訂單管理</h1>
          <p className="text-[13px] text-ash-gray-400 mt-0.5">
            {filtered.length} 筆訂單（共 {orders.length} 筆）
            {lastFetch && <span className="ml-2 text-[10px] text-ash-gray-300">上次更新 {lastFetch}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={filtered.length === 0} className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-white bg-ash-black hover:bg-ash-gray-800 disabled:opacity-30 px-4 py-2.5 transition-colors font-medium">
            <Download className="h-3 w-3" /> 匯出 CSV
          </button>
          <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-ash-gray-500 hover:text-ash-black px-4 py-2 border border-ash-gray-200 hover:border-ash-black transition-colors">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> 手動刷新
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-ash-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-ash-gray-400 shrink-0" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="搜尋訂單編號 / 客戶 / 手機 / LINE ID..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="p-1 hover:bg-ash-gray-100 rounded">
              <X className="h-3 w-3 text-ash-gray-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-ash-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-ash-gray-200 px-3 py-2 outline-none focus:border-ash-black bg-white"
          >
            <option value="">全部狀態</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>
            ))}
          </select>
        </div>

        {(searchText || statusFilter) && (
          <button onClick={clearFilters} className="text-[10px] tracking-wider text-ash-gray-400 hover:text-ash-black underline">
            清除篩選
          </button>
        )}
      </div>

      {/* 表格 */}
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
            {filtered.map((o: any) => {
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
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-[13px] text-ash-gray-300">
                {searchText || statusFilter ? "沒有符合條件的訂單" : "尚無訂單"}
              </td></tr>
            )}
            {loading && orders.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-[13px] text-ash-gray-300">
                <RefreshCw className="h-4 w-4 inline animate-spin mr-2"/>載入中...
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
