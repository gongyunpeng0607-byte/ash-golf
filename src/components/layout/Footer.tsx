import Link from "next/link";

const SHOP_LINKS = [
  { href: "/collections/new", label: "新品上市" },
  { href: "/products", label: "全部商品" },
  { href: "/categories/golf-clubs", label: "高爾夫球具" },
  { href: "/categories/golf-accessories", label: "配件" },
  { href: "/collections/brands", label: "品牌總覽" },
];

const SERVICE_ITEMS = ["貨到付款", "免運 · 滿 NT$3,000", "正品保證", "LINE wq2007"];

export function Footer() {
  return (
    <footer className="bg-ash-black text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base tracking-[0.15em] font-bold mb-4">ASH GOLF</h3>
            <p className="text-[11px] text-white/40 leading-relaxed">ONLY THE BEST.<br />致力為台灣球友引進全球頂級高爾夫品牌。</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5">SHOP</h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[12px] text-white/50 hover:text-white transition-colors duration-200">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5">SERVICE</h4>
            <ul className="space-y-3">
              {SERVICE_ITEMS.map(item => (
                <li key={item} className="text-[12px] text-white/50">{item}</li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5">PAYMENT</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] tracking-[0.15em] text-white/40">
              <span>VISA</span><span>MASTERCARD</span><span>JCB</span><span>LINE PAY</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] tracking-[0.15em] text-white/25 uppercase">&copy; {new Date().getFullYear()} ASH GOLF. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
