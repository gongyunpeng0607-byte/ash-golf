import Link from "next/link";

export function Footer() {
  const links = {
    SHOP: [
      { href: "/collections/new", label: "新品上市" },
      { href: "/products", label: "全部商品" },
      { href: "/categories/golf-clubs", label: "高爾夫球具" },
      { href: "/categories/golf-accessories", label: "配件" },
      { href: "/collections/brands", label: "品牌總覽" },
    ],
    INFO: [
      { href: "#", label: "關於我們" },
      { href: "#", label: "配送說明" },
      { href: "#", label: "退換貨政策" },
      { href: "#", label: "隱私權政策" },
      { href: "#", label: "常見問題" },
    ],
  };

  return (
    <footer className="bg-ash-black text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base tracking-[0.15em] font-bold mb-4">ASH GOLF</h3>
            <p className="text-[11px] text-white/40 leading-relaxed">ONLY THE BEST.<br />致力為台灣球友引進全球頂級高爾夫品牌。</p>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-5">{title}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[12px] text-white/50 hover:text-white transition-colors duration-200">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-14 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] tracking-[0.15em] text-white/25 uppercase">&copy; {new Date().getFullYear()} ASH GOLF. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-5 text-[10px] tracking-[0.15em] text-white/25">
            <span>VISA</span><span>MASTERCARD</span><span>JCB</span><span>LINE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
