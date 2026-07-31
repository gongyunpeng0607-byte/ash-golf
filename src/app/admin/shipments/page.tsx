"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Package, ShoppingBag, CheckCircle, Send,
  RefreshCw, MapPin, Phone, Hash, Plus, Minus, Edit3, Search,
  Box, Clock, AlertCircle, ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";

const STATUSES = [
  { key: "", label: "待處理", icon: Clock, color: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
  { key: "purchasing", label: "採購中", icon: ShoppingBag, color: "bg-blue-50 border-blue-200 text-blue-700", dot: "bg-blue-500" },
  { key: "partial", label: "部分到倉", icon: Box, color: "bg-purple-50 border-purple-200 text-purple-700", dot: "bg-purple-500" },
  { key: "arrived", label: "待發貨", icon: AlertCircle, color: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
  { key: "shipped", label: "已發貨", icon: Send, color: "bg-ash-gray-50 border-ash-gray-200 text-ash-gray-600", dot: "bg-ash-gray-400" },
  { key: "delivered", label: "已送達", icon: CheckCircle, color: "bg-ash-gray-50/50 border-ash-gray-100 text-ash-gray-400", dot: "bg-ash-gray-300" },
];

function formatDate(ts: string) {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function ShipmentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ itemCount: 0, arrivedCount: 0, purchaseOrderNo: "", trackingNo: "" });
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [prevArrivedIds, setPrevArrivedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/shipments");
      const data = await res.json();
      if (data.orders) {
        // 检测新到仓
        const newArrivedIds = new Set<string>();
        data.orders.forEach((o: any) => {
          if (o.purchaseStatus === "arrived" || (o.arrivedCount >= o.itemCount && o.itemCount > 0)) {
            newArrivedIds.add(o.id);
          }
        });
        const newArrived = [...newArrivedIds].filter(id => !prevArrivedIds.has(id));

        setOrders(data.orders);
        setPrevArrivedIds(newArrivedIds);

        // 提醒
        if (newArrived.length > 0 && prevArrivedIds.size > 0) {
          const names = data.orders.filter((o: any) => newArrived.includes(o.id)).map((o: any) => o.recipientName).join("、");
          setAlerts(prev => [...prev, `📦 ${names} 的貨已全部到倉，請發貨！`]);
          setTimeout(() => setAlerts(prev => prev.slice(1)), 10000);

          // 声音
          if (soundOn) {
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
              });
            } catch {}
            try {
              if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(`${names}的貨已全部到倉，請安排發貨`);
                u.lang = "zh-TW"; u.rate = 1.0; u.pitch = 1.2;
                window.speechSynthesis.speak(u);
              }
            } catch {}
          }
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [prevArrivedIds, soundOn]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdate = async (id: string, data: any) => {
    try {
      const res = await fetch("/api/admin/shipments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) { await fetchOrders(); router.refresh(); }
    } catch { setError("更新失敗"); }
  };

  const startEdit = (o: any) => {
    setEditing(o.id);
    setEditForm({
      itemCount: o.itemCount || 1,
      arrivedCount: o.arrivedCount || 0,
      purchaseOrderNo: o.purchaseOrderNo || "",
      trackingNo: o.trackingNo || "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const allArrived = editForm.arrivedCount >= editForm.itemCount && editForm.itemCount > 0;
    const order = orders.find(o => o.id === editing);
    const status = allArrived ? "arrived" : editForm.arrivedCount > 0 ? "partial" : order?.purchaseStatus || "purchasing";
    await handleUpdate(editing, {
      itemCount: editForm.itemCount,
      arrivedCount: editForm.arrivedCount,
      purchaseOrderNo: editForm.purchaseOrderNo,
      trackingNo: editForm.trackingNo,
      purchaseStatus: status,
      isDropship: true,
    });
    setEditing(null);
    setSaving(false);
  };

  const quickAction = (o: any, action: string) => {
    if (action === "start") {
      handleUpdate(o.id, { purchaseStatus: "purchasing", isDropship: true });
    } else if (action === "arrive") {
      const next = Math.min((o.arrivedCount || 0) + 1, o.itemCount || 1);
      const status = next >= (o.itemCount || 1) ? "arrived" : "partial";
      handleUpdate(o.id, { arrivedCount: next, purchaseStatus: status });
    } else if (action === "ship") {
      handleUpdate(o.id, { purchaseStatus: "shipped" });
    } else if (action === "deliver") {
      handleUpdate(o.id, { purchaseStatus: "delivered" });
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.recipientName?.toLowerCase().includes(q) ||
           o.recipientPhone?.includes(q) || o.orderNo?.toLowerCase().includes(q) ||
           (o.purchaseOrderNo || "").toLowerCase().includes(q) ||
           (o.trackingNo || "").toLowerCase().includes(q);
  });

  // 按状态分组
  const groups = STATUSES.map(s => ({
    ...s,
    orders: filtered.filter(o => (o.purchaseStatus || "") === s.key),
  }));

  // 待处理的数量
  const pendingCount = orders.filter(o => !o.purchaseStatus || o.purchaseStatus === "arrived").length;

  return (
    <div>
      {/* 提醒横幅 */}
      <AnimatePresence>
        {alerts.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-green-500 text-white px-5 py-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="text-sm font-bold">{msg}</p>
                <p className="text-[11px] text-white/80">點擊訂單即可操作發貨</p>
              </div>
            </div>
            <button onClick={() => setAlerts([])} className="text-white/70 hover:text-white text-lg">&times;</button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">發貨管理</h1>
          <p className="text-[13px] text-ash-gray-400 mt-0.5">
            {orders.length} 筆代購訂單
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {pendingCount} 待處理
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`text-[10px] tracking-wider uppercase px-3 py-2 border transition-colors font-medium rounded-lg ${
              soundOn ? "bg-green-50 text-green-700 border-green-200" : "text-ash-gray-400 border-ash-gray-200"
            }`}
          >
            {soundOn ? "🔔 提醒開" : "🔇 提醒關"}
          </button>
          <button onClick={fetchOrders} disabled={loading} className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-ash-gray-500 hover:text-ash-black px-4 py-2.5 border border-ash-gray-200 hover:border-ash-black rounded-lg transition-colors">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> 刷新
          </button>
        </div>
      </div>

      {error && <p className="text-[12px] text-red-600 bg-red-50 px-4 py-2 mb-4 rounded-lg">{error}</p>}

      {/* 搜索 */}
      <div className="flex items-center gap-2 mb-6 bg-white border border-ash-gray-100 rounded-xl px-4 py-2.5">
        <Search className="h-3.5 w-3.5 text-ash-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋客戶姓名 / 手機 / 拼多多單號..."
          className="flex-1 text-sm outline-none bg-transparent"
        />
      </div>

      {/* 看板 - 按状态分列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {groups.map(group => (
          <div key={group.key} className="flex flex-col min-h-[200px]">
            {/* 列头 */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl border ${group.color} mb-2`}>
              <group.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] tracking-wider font-bold uppercase">{group.label}</span>
              <span className="ml-auto text-[11px] font-bold">{group.orders.length}</span>
            </div>

            {/* 订单卡片 */}
            <div className="flex-1 space-y-2">
              {group.orders.map((o: any) => (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-ash-gray-50 rounded-xl p-4 hover:border-ash-gray-200 hover:shadow-sm transition-all duration-200"
                >
                  {editing === o.id ? (
                    /* 编辑模式 */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-ash-gray-400 uppercase">總件數</label>
                          <input type="number" className="w-full border px-2 py-1.5 text-xs rounded-lg" value={editForm.itemCount}
                            onChange={e => setEditForm(p => ({ ...p, itemCount: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div>
                          <label className="text-[9px] text-ash-gray-400 uppercase">已到件</label>
                          <input type="number" className="w-full border px-2 py-1.5 text-xs rounded-lg" value={editForm.arrivedCount}
                            onChange={e => setEditForm(p => ({ ...p, arrivedCount: Math.min(parseInt(e.target.value) || 0, editForm.itemCount) }))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-ash-gray-400 uppercase">拼多多單號</label>
                        <input className="w-full border px-2 py-1.5 text-xs rounded-lg"
                          value={editForm.purchaseOrderNo} onChange={e => setEditForm(p => ({ ...p, purchaseOrderNo: e.target.value }))}
                          placeholder="PDD2024..." />
                      </div>
                      <div>
                        <label className="text-[9px] text-ash-gray-400 uppercase">物流單號</label>
                        <input className="w-full border px-2 py-1.5 text-xs rounded-lg"
                          value={editForm.trackingNo} onChange={e => setEditForm(p => ({ ...p, trackingNo: e.target.value }))}
                          placeholder="輸入物流追蹤號碼" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving}
                          className="flex-1 bg-ash-black text-white text-[10px] py-1.5 rounded-lg font-bold">
                          {saving ? "儲存中" : "儲存"}
                        </button>
                        <button onClick={() => setEditing(null)}
                          className="px-3 text-[10px] border rounded-lg text-ash-gray-400">
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 显示模式 */
                    <>
                      {/* 客户信息 */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-bold truncate">{o.recipientName}</p>
                        <button onClick={() => startEdit(o)} className="p-1 hover:bg-ash-gray-100 rounded-lg">
                          <Edit3 className="h-3 w-3 text-ash-gray-400" />
                        </button>
                      </div>

                      {/* 进度条 */}
                      {o.itemCount > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-[10px] text-ash-gray-400 mb-1">
                            <span>到倉進度</span>
                            <span className="font-mono">{o.arrivedCount || 0}/{o.itemCount}</span>
                          </div>
                          <div className="h-1.5 bg-ash-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                (o.arrivedCount || 0) >= o.itemCount ? "bg-green-500" :
                                (o.arrivedCount || 0) > 0 ? "bg-amber-500" : "bg-ash-gray-200"
                              }`}
                              style={{ width: `${((o.arrivedCount || 0) / o.itemCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 号码 */}
                      <div className="space-y-0.5 text-[10px] text-ash-gray-400 mb-3">
                        {o.purchaseOrderNo && (
                          <div className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" />拼多多: {o.purchaseOrderNo}</div>
                        )}
                        {o.trackingNo && (
                          <div className="flex items-center gap-1"><Truck className="h-2.5 w-2.5" />物流: {o.trackingNo}</div>
                        )}
                        <div className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{o.recipientPhone}</div>
                        <div className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{o.shippingAddress?.slice(0, 20)}...</div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex flex-wrap gap-1">
                        {(!o.purchaseStatus || o.purchaseStatus === "") && (
                          <button onClick={() => quickAction(o, "start")}
                            className="flex-1 flex items-center justify-center gap-1 text-[9px] bg-ash-black text-white px-2 py-1.5 rounded-lg font-bold">
                            <ShoppingBag className="h-2.5 w-2.5" /> 開始採購
                          </button>
                        )}
                        {(o.purchaseStatus === "purchasing" || o.purchaseStatus === "partial") && (
                          <button onClick={() => quickAction(o, "arrive")}
                            className="flex-1 flex items-center justify-center gap-1 text-[9px] bg-purple-500 text-white px-2 py-1.5 rounded-lg font-bold">
                            <Plus className="h-2.5 w-2.5" /> 到倉 +1
                          </button>
                        )}
                        {(o.purchaseStatus === "arrived" || (o.arrivedCount >= o.itemCount && o.itemCount > 0 && o.purchaseStatus !== "shipped" && o.purchaseStatus !== "delivered")) && (
                          <button onClick={() => quickAction(o, "ship")}
                            className="flex-1 flex items-center justify-center gap-1 text-[9px] bg-green-500 text-white px-2 py-1.5 rounded-lg font-bold">
                            <Send className="h-2.5 w-2.5" /> 發貨
                          </button>
                        )}
                        {o.purchaseStatus === "shipped" && (
                          <button onClick={() => quickAction(o, "deliver")}
                            className="flex-1 flex items-center justify-center gap-1 text-[9px] bg-ash-gray-500 text-white px-2 py-1.5 rounded-lg font-bold">
                            <CheckCircle className="h-2.5 w-2.5" /> 已送達
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
              {group.orders.length === 0 && (
                <div className="text-center py-8 text-[11px] text-ash-gray-300">—</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {loading && orders.length === 0 && (
        <div className="text-center py-20">
          <RefreshCw className="h-5 w-5 inline animate-spin text-ash-gray-300" />
          <p className="text-sm text-ash-gray-300 mt-3">載入中...</p>
        </div>
      )}
    </div>
  );
}
