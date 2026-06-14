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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = subtotal() + (subtotal() >= 3000 ? 0 : 100);

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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "請輸入收件人姓名";
    if (!lineId.trim()) errs.lineId = "請輸入您的 LINE ID，方便客服聯繫";
    if (!address.trim()) errs.address = "請選擇配送地址";

    const phoneClean = phone.replace(/\s/g, "");
    if (!phoneClean) {
      errs.phone = "請輸入手機號碼";
    } else if (!/^09\d{8}$/.test(phoneClean)) {
      errs.phone = "手機格式錯誤，請輸入 09XXXXXXXX";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: name,
          recipientPhone: phone.replace(/\s/g, ""),
          shippingAddress: address,
          shippingMethod: "home",
          paymentMethod: "cod",
          note: `LINE: ${lineId}${note ? ` | ${note}` : ""}`,
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

  const FIELD = "w-full border px-4 py-3 text-sm outline-none transition-colors";
  const LABEL = "block text-xs mb-1.5 font-medium";

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <Link href="/cart" className="text-xs text-ash-gray-400 hover:text-ash-black mb-8 inline-block">← 返回購物車</Link>
      <h1 className="text-xl font-bold mb-8">填寫收件資訊</h1>

      <div className="mb-8 p-4 bg-ash-gray-50 space-y-2 rounded-lg">
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
        {/* 姓名 */}
        <div>
          <label className={LABEL + " text-ash-gray-600"}>收件人姓名 <span className="text-red-500">*</span></label>
          <input
            className={FIELD + (errors.name ? " border-red-400 bg-red-50" : " border-ash-gray-200 focus:border-ash-black")}
            value={name}
            onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => { const { name, ...r } = p; return r; }); }}
            placeholder="請輸入姓名"
          />
          {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* 手机 */}
        <div>
          <label className={LABEL + " text-ash-gray-600"}>手機號碼 <span className="text-red-500">*</span></label>
          <input
            className={FIELD + (errors.phone ? " border-red-400 bg-red-50" : " border-ash-gray-200 focus:border-ash-black")}
            value={phone}
            onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => { const { phone, ...r } = p; return r; }); }}
            placeholder="09XXXXXXXX"
          />
          {errors.phone ? (
            <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
          ) : (
            <p className="text-[10px] text-ash-gray-400 mt-1">格式：09 開頭共 10 碼</p>
          )}
        </div>

        {/* LINE ID — 必填 */}
        <div>
          <label className={LABEL + " text-ash-gray-600"}>LINE ID <span className="text-red-500">*</span></label>
          <input
            className={FIELD + (errors.lineId ? " border-red-400 bg-red-50" : " border-ash-gray-200 focus:border-ash-black")}
            value={lineId}
            onChange={e => { setLineId(e.target.value); if (errors.lineId) setErrors(p => { const { lineId, ...r } = p; return r; }); }}
            placeholder="請輸入您的 LINE ID（必填，客服將通過 LINE 聯繫您）"
          />
          {errors.lineId && <p className="text-[11px] text-red-500 mt-1">{errors.lineId}</p>}
        </div>

        {/* 地址 */}
        <div>
          <label className={LABEL + " text-ash-gray-600"}>配送地址 <span className="text-red-500">*</span></label>
          <AddressSelect value={address} onChange={v => { setAddress(v); if (errors.address) setErrors(p => { const { address, ...r } = p; return r; }); }} required />
          {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
        </div>

        {/* 备注 */}
        <div>
          <label className={LABEL + " text-ash-gray-400"}>備註（選填）</label>
          <textarea className={FIELD + " border-ash-gray-200 focus:border-ash-black resize-none"} value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="有其他需求請填寫..." />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-ash-black text-white text-sm tracking-[0.15em] uppercase py-4 font-bold hover:bg-ash-gray-800 disabled:opacity-50 transition-colors rounded-lg">
          {submitting ? "處理中..." : "確認下單"}
        </button>
        <p className="text-[11px] text-ash-gray-400 text-center">下單後請掃 LINE QR Code 聯繫客服確認訂單</p>
      </form>
    </div>
  );
}
