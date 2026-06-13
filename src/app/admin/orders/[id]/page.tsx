export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/turso-db";
import { formatTWD, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft, MapPin, Phone, User, Package, Truck, Clock, FileText, MessageCircle, Mail } from "lucide-react";

interface Props { params: Promise<{ id: string }>; }

function extractLineId(note: string): string | null {
  const i = note.indexOf("LINE:");
  if (i < 0) return null;
  const after = note.slice(i + 5);
  const bar = after.indexOf("|");
  return (bar >= 0 ? after.slice(0, bar) : after).trim();
}

function removeLineFromNote(note: string): string {
  const i = note.indexOf("LINE:");
  if (i < 0) return note;
  const after = note.slice(i + 5);
  const bar = after.indexOf("|");
  const rest = bar >= 0 ? after.slice(bar + 1) : "";
  return (note.slice(0, i) + rest).trim();
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id) as any;
  if (!order) notFound();

  const note = order.note || "";
  const lineId = extractLineId(note);
  const cleanNote = lineId ? removeLineFromNote(note) : note;

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
            <div className="flex items-start gap-3"><User className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">姓名</span><span className="text-[13px] font-medium">{order.recipientName}</span></div>
            <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">手機</span><span className="text-[13px] font-medium">{order.recipientPhone}</span></div>
            {order.recipientEmail && <div className="flex items-start gap-3"><Mail className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">Email</span><span className="text-[13px] font-medium">{order.recipientEmail}</span></div>}
            <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">地址</span><span className="text-[13px] font-medium">{order.shippingAddress}</span></div>
          </div>
        </div>

        <div className="bg-white border border-ash-gray-50 rounded-xl p-6">
          <h2 className="text-xs tracking-[0.12em] uppercase font-bold text-ash-gray-400 mb-5 flex items-center gap-2"><Package className="h-3.5 w-3.5"/> 訂單資訊</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-ash-gray-300 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">付款</span><span className="text-[13px] font-medium">貨到付款</span></div>
            <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-ash-gray-300 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">配送</span><span className="text-[13px] font-medium">{(order.shippingMethod as string)==="home"?"宅配到府":order.shippingMethod}</span></div>
            <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-ash-gray-300 shrink-0"/><span className="text-[11px] text-ash-gray-400 w-12 shrink-0">日期</span><span className="text-[13px] font-medium">{formatDate(order.createdAt as string)}</span></div>
          </div>

          {lineId && (
            <div className="mt-4 p-4 bg-[#06C755]/5 border border-[#06C755]/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1"><MessageCircle className="h-4 w-4 text-[#06C755]"/><span className="text-xs font-bold text-[#06C755]">客戶 LINE</span></div>
              <p className="text-sm font-bold">{lineId}</p>
              <a href={`https://line.me/ti/p/${lineId.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#06C755] underline mt-1 inline-block">開啟 LINE 聯繫客戶 →</a>
            </div>
          )}

          {cleanNote && (
            <div className="mt-4 flex items-start gap-3"><FileText className="h-4 w-4 text-ash-gray-300 mt-0.5 shrink-0"/><div><span className="text-[11px] text-ash-gray-400 block">備註</span><span className="text-[13px]">{cleanNote}</span></div></div>
          )}

          <hr className="border-ash-gray-50 my-4"/>
          <div className="flex justify-between items-center"><span className="text-sm font-bold">總金額</span><span className="text-lg font-bold">{formatTWD(Number(order.totalAmount))}</span></div>
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
