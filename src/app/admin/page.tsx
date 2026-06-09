import Link from "next/link";
import { db } from "@/lib/db";
import { formatTWD } from "@/lib/format";
import { Box, ShoppingBag, TrendingUp, Plus, ArrowRight, Eye } from "lucide-react";

async function getStats() {
  const [productCount, orderCount, totalRevenue, recentOrders] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "cancelled" } } }),
    db.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);
  return { productCount, orderCount, totalRevenue: totalRevenue._sum.totalAmount || 0, recentOrders };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">儀表板</h1>
          <p className="text-[13px] text-ash-gray-400 mt-0.5">總覽您的商城數據</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-ash-black text-white text-[11px] tracking-wider uppercase px-5 py-2.5 font-medium hover:bg-ash-gray-800 transition-all duration-200 active:scale-[0.98]">
          <Plus className="h-3.5 w-3.5" /> 新增商品
        </Link>
      </div>

      {/* Key metrics */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "商品總數", value: stats.productCount, icon: Box, color: "bg-ash-black" },
          { label: "訂單總數", value: stats.orderCount, icon: ShoppingBag, color: "bg-ash-gray-800" },
          { label: "累計營收", value: formatTWD(stats.totalRevenue), icon: TrendingUp, color: "bg-ash-gray-600" },
        ].map(card => (
          <div key={card.label} className="bg-white border border-ash-gray-50 p-6 rounded-lg hover:shadow-sm transition-shadow duration-300">
            <div className={`${card.color} w-10 h-10 flex items-center justify-center rounded-lg mb-4`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ash-gray-50">
          <h2 className="text-sm font-bold tracking-tight">近期訂單</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-[10px] tracking-wider uppercase text-ash-gray-400 hover:text-ash-black transition-colors">
            查看全部 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-ash-gray-50">
              <th className="text-left px-6 py-3 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">訂單編號</th>
              <th className="text-left px-6 py-3 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">客戶</th>
              <th className="text-left px-6 py-3 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">金額</th>
              <th className="text-left px-6 py-3 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">狀態</th>
              <th className="text-right px-6 py-3 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">日期</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map(o => (
              <tr key={o.id} className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-[13px] font-mono text-ash-black font-medium">{o.orderNo}</td>
                <td className="px-6 py-4 text-[13px]">{o.recipientName}</td>
                <td className="px-6 py-4 text-[13px] font-bold">{formatTWD(o.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-medium rounded-full ${
                    o.status === "paid" || o.status === "delivered" ? "bg-green-50 text-green-700" :
                    o.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-ash-gray-100 text-ash-gray-600"
                  }`}>{o.status}</span>
                </td>
                <td className="px-6 py-4 text-[12px] text-ash-gray-400 text-right">{new Date(o.createdAt).toLocaleDateString("zh-TW")}</td>
              </tr>
            ))}
            {stats.recentOrders.length === 0 && <tr><td colSpan={5} className="px-6 py-16 text-center text-[13px] text-ash-gray-300">尚無訂單</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
