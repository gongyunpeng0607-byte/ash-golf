import Link from "next/link";
import { db } from "@/lib/db";
import { formatTWD, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderActions } from "@/components/admin/OrderActions";
import { Eye } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">訂單管理</h1>
      <div className="bg-white border border-ash-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ash-gray-100 bg-ash-gray-50">
                <th className="text-left px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">訂單編號</th>
                <th className="text-left px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">客戶 / 手機</th>
                <th className="text-left px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">地址</th>
                <th className="text-left px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">金額</th>
                <th className="text-left px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">狀態</th>
                <th className="text-left px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">日期</th>
                <th className="text-right px-5 py-3.5 text-[10px] tracking-wider uppercase text-ash-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-ash-gray-50 hover:bg-ash-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-mono text-ash-black hover:text-ash-gray-600 font-medium">{order.orderNo}</Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px] font-medium">{order.recipientName}</p>
                    <p className="text-[11px] text-ash-gray-400">{order.recipientPhone}</p>
                  </td>
                  <td className="px-5 py-4"><p className="text-[13px] text-ash-gray-600 max-w-[220px] truncate">{order.shippingAddress}</p></td>
                  <td className="px-5 py-4 text-[13px] font-bold">{formatTWD(order.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase font-medium ${
                      order.status === "paid" || order.status === "delivered" ? "bg-green-50 text-green-700" :
                      order.status === "cancelled" ? "bg-red-50 text-red-700" :
                      order.status === "processing" || order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                      "bg-ash-gray-100 text-ash-gray-600"
                    }`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ash-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/orders/${order.id}`} className="p-2 hover:bg-ash-gray-100 transition-colors"><Eye className="h-4 w-4" /></Link>
                      <OrderActions orderId={order.id} currentStatus={order.status} />
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="px-5 py-16 text-center text-[13px] text-ash-gray-400">尚無訂單</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
