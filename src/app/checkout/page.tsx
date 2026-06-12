"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { formatTWD } from "@/lib/format";
import { AddressSelect } from "@/components/checkout/AddressSelect";
import { LINEQRModal } from "@/components/checkout/LINEQRModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [showLINE, setShowLINE] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lineId, setLineId] = useState("");
  const [note, setNote] = useState("");

  const total = subtotal() + (subtotal() >= 3000 ? 0 : 100);

  // LINE 弹窗 — 在清空购物车前记录订单信息，避免提前 return
  if (showLINE) {
    return <LINEQRModal open={showLINE} onClose={() => { setShowLINE(false); router.push("/"); }} orderNo={orderNo} />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-32 text-center">
        <p className="text-6xl mb-4 opacity-20">🛒</p>
        <p className="text-sm text-ash-gray-500 mb-8">購物車是空的</p>
        <Link href="/products" className="inline-block bg-ash-black text-white text-xs tracking-[0.2em] uppercase px-10 py-4 font-bold hover:bg-ash-gray-800">去逛逛</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) { alert("請填寫姓名、手機和地址"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: name,
          recipientPhone: phone,
          recipientEmail: "",
          shippingAddress: address,
          shippingMethod: "home",
          paymentMethod: "cod",
          note: lineId ? `LINE: ${lineId}${note ? ` | ${note}` : ""}` : note,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
          totalAmount: total,
          shippingFee: subtotal() >= 3000 ? 0 : 100,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNo(data.orderNo);
        clearCart();
        setShowLINE(true);
      } else {
        alert(data.error || "結帳失敗");
        setSubmitting(false);
      }
    } catch { alert("結帳失敗"); setSubmitting(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <Link href="/cart" className="text-xs text-ash-gray-400 hover:text-ash-black mb-8 inline-block">← 返回購物車</Link>
      <h1 className="text-xl font-bold mb-8">填寫收件資訊</h1>

      <div className="mb-8 p-4 bg-ash-gray-50 space-y-2">
        {items.map(item => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-ash-gray-600 truncate">{item.name} ×{item.quantity}</span>
            <span className="shrink-0 ml-2">{formatTWD(item.price * item.quantity)}</span>
          </div>
        ))}
        <hr className="border-ash-gray-200" />
        <div className="flex justify-between font-bold text-base pt-1"><span>合計（貨到付款）</span><span>{formatTWD(total)}</span></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs text-ash-gray-500 mb-1.5">收件人姓名 *</label>
          <input required className="w-full border border-ash-gray-200 px-4 py-3 text-sm outline-none focus:border-ash-black transition-colors" value={name} onChange={e => setName(e.target.value)} placeholder="請輸入姓名" />
        </div>
        <div>
          <label className="block text-xs text-ash-gray-500 mb-1.5">手機號碼 *</label>
          <input required className="w-full border border-ash-gray-200 px-4 py-3 text-sm outline-none focus:border-ash-black transition-colors" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label className="block text-xs text-ash-gray-500 mb-1.5">LINE ID（選填，方便客服聯繫您）</label>
          <input className="w-full border border-ash-gray-200 px-4 py-3 text-sm outline-none focus:border-ash-black transition-colors" value={lineId} onChange={e => setLineId(e.target.value)} placeholder="請輸入您的 LINE ID" />
        </div>
        <div>
          <label className="block text-xs text-ash-gray-500 mb-1.5">配送地址 *</label>
          <AddressSelect value={address} onChange={setAddress} required />
        </div>
        <div>
          <label className="block text-xs text-ash-gray-500 mb-1.5">備註（選填）</label>
          <textarea className="w-full border border-ash-gray-200 px-4 py-3 text-sm outline-none focus:border-ash-black transition-colors resize-none" value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="有其他需求請填寫..." />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-ash-black text-white text-sm tracking-[0.15em] uppercase py-4 font-bold hover:bg-ash-gray-800 disabled:opacity-50 transition-colors">
          {submitting ? "處理中..." : "確認下單"}
        </button>
        <p className="text-[11px] text-ash-gray-400 text-center">下單後請加 LINE 確認訂單</p>
      </form>
    </div>
  );
}
