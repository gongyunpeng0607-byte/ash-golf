import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/turso-db";
import { formatTWD, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft, MapPin, Phone, User, Package, Truck, Clock, FileText } from "lucide-react";

interface Props { params: Promise<{ id: string }>; }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id) as any;
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs text-ash-gray-400 hover:text-ash-black mb-8"><ArrowLeft className="h-3 w-3"/> 返回訂單列表</Link>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-[22px] font-bold tracking-tight">訂單詳情</h1><p className="text-[13px] text-ash-gray-400 mt-0.5 font-mono">{order.orderNo}</p></div>
        <span className={`px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-bold rounded-full ${order.status==="paid"||order.status==="delivered"?"bg-green-50 text-green-700":order.status==="cancelled"?"bg-red-50 text-red-600":"bg-ash-gray-100 text-ash-gray-600"}`}>{ORDER_STATUS_LABELS[order.status as string]||order.status}</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-ash-gray-50 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.12em] uppercase font-bold text-ash-gray-400 mb-5 flex items-center gap-2"><User className="h-3.5 w-3.5"/> 客戶資訊</h2>
          <div className="space-y-4">
            {[{icon:User,label:"姓名",value:order.recipientName},{icon:Phone,label:"手機",value:order.recipientPhone},{icon:MapPin,label:"地址",value:order.shippingAddress}].map(r => <div key={r.label} className="flex items-start gap-3"><r.icon className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">{r.label}</span><span className="text-[13px] font-medium">{r.value}</span></div>)}
          </div>
        </div>
        <div className="bg-white border border-ash-gray-50 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.12em] uppercase font-bold text-ash-gray-400 mb-5 flex items-center gap-2"><Package className="h-3.5 w-3.5"/> 訂單資訊</h2>
          <div className="space-y-4">
            {[{icon:Truck,label:"付款",value:"貨到付款"},{icon:Truck,label:"配送",value:(order.shippingMethod as string)==="home"?"宅配到府":order.shippingMethod},{icon:Clock,label:"日期",value:formatDate(order.createdAt as string)}].map(r => <div key={r.label} className="flex items-center gap-3"><r.icon className="h-4 w-4 text-ash-gray-300 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">{r.label}</span><span className="text-[13px] font-medium">{r.value}</span></div>)}
            {order.note && <div className="flex items-start gap-3"><FileText className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">備註</span><span className="text-[13px]">{order.note}</span></div>}
          </div>
          <hr className="border-ash-gray-50 my-4"/><div className="flex justify-between items-center"><span className="text-sm font-bold">總金額</span><span className="text-lg font-bold">{formatTWD(Number(order.totalAmount))}</span></div>
        </div>
      </div>
      <div className="mt-6 bg-white border border-ash-gray-50 rounded-xl p-6">
        <h2 className="text-xs tracking-[0.12em] uppercase font-bold text-ash-gray-400 mb-5">商品明細 ({(order.items as any[])?.length||0})</h2>
        <div className="space-y-3">{(order.items as any[])?.map((item:any) => (
          <div key={item.id} className="flex gap-4 p-4 bg-ash-gray-50 rounded-lg">
            <div className="w-14 h-16 bg-ash-gray-200 rounded-lg flex items-center justify-center text-xl shrink-0">🏌️</div>
            <div className="flex-1">
              <Link href={`/products/${item.product?.slug||item.productSlug||""}`} className="text-[13px] font-medium hover:text-ash-gray-600">{item.product?.name||item.productName||"—"}</Link>
              <div className="flex items-center gap-4 mt-1 text-[12px] text-ash-gray-500"><span>×{item.quantity}</span><span>{formatTWD(Number(item.price))} /件</span></div>
            </div>
            <span className="text-[13px] font-bold shrink-0">{formatTWD(Number(item.price)*Number(item.quantity))}</span>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
