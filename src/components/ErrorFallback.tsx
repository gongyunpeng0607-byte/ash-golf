import Link from "next/link";

export function ErrorFallback({ message }: { message?: string }) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-32 text-center">
      <p className="text-5xl mb-4 opacity-20">—</p>
      <p className="text-sm text-ash-gray-500 mb-2">{message || "頁面暫時無法載入"}</p>
      <p className="text-xs text-ash-gray-400 mb-8">請稍後再試</p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="inline-block bg-ash-black text-white text-xs tracking-wider uppercase px-8 py-3 font-bold hover:bg-ash-gray-800">回首頁</Link>
        <button onClick={() => window.location.reload()} className="inline-block border border-ash-black text-ash-black text-xs tracking-wider uppercase px-8 py-3 font-bold hover:bg-ash-gray-50">重新整理</button>
      </div>
    </div>
  );
}
