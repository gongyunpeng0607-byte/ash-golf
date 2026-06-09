import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-32 px-6">
      <p className="text-[80px] leading-none mb-6 opacity-20">404</p>
      <p className="text-sm text-ash-gray-500 mb-10">找不到此頁面</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <button className="bg-ash-black text-white text-xs tracking-[0.2em] uppercase px-10 py-4 font-bold hover:bg-ash-gray-800 transition-colors w-full sm:w-auto">
            返回首頁
          </button>
        </Link>
        <Link href="/products">
          <button className="border border-ash-black text-ash-black text-xs tracking-[0.2em] uppercase px-10 py-4 font-bold hover:bg-ash-black hover:text-white transition-colors w-full sm:w-auto">
            瀏覽商品
          </button>
        </Link>
      </div>
    </div>
  );
}
