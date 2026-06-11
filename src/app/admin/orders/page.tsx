import Link from "next/link";
import { getOrders } from "@/lib/turso-db";
import { formatTWD, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderActions } from "@/components/admin/OrderActions";
import { Eye } from "lucide-react";

export default async function AdminOrdersPage() {
  const { orders } = await getOrders(1, 100);

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-8 tracking-tight">訂單管理</h1>
      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-ash-gray-50 bg-ash-gray-50/50"><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">訂單編號</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">客戶 / 手機</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">地址</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">金額</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">狀態</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">日期</th><th className="text-right px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">操作</th></tr></thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors">
                <td className="px-5 py-4"><Link href={`/admin/orders/${o.id}`} className="text-[13px] font-mono font-medium hover:text-ash-gray-600">{o.orderNo}</Link></td>
                <td className="px-5 py-4"><p className="text-[13px] font-medium">{o.recipientName}</p><p className="text-[11px] text-ash-gray-400">{o.recipientPhone}</p></td>
                <td className="px-5 py-4"><p className="text-[13px] text-ash-gray-600 max-w-[200px] truncate">{o.shippingAddress}</p></td>
                <td className="px-5 py-4 text-[13px] font-bold">{formatTWD(Number(o.totalAmount))}</td>
                <td className="px-5 py-4"><span className={`px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-medium rounded-full ${o.status==="paid"||o.status==="delivered"?"bg-green-50 text-green-700":o.status==="cancelled"?"bg-red-50 text-red-600":o.status==="processing"||o.status==="shipped"?"bg-blue-50 text-blue-700":"bg-ash-gray-100 text-ash-gray-600"}`}>{ORDER_STATUS_LABELS[o.status as string]||o.status}</span></td>
                <td className="px-5 py-4 text-[12px] text-ash-gray-400">{formatDate(o.createdAt as string)}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/orders/${o.id}`} className="p-2 hover:bg-ash-gray-50 rounded-lg"><Eye className="h-3.5 w-3.5"/></Link>
                    <OrderActions orderId={o.id as string} currentStatus={o.status as string}/>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length===0&&<tr><td colSpan={7} className="px-5 py-16 text-center text-[13px] text-ash-gray-300">尚無訂單</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
