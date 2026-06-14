"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatTWD } from "@/lib/format";
import { Plus, Pencil, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

const PAGE_SIZE = 20;

function ThumbCell({ productId }: { productId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { setSrc(`/api/products/${productId}/thumb`); setLoaded(true); } };
    img.onerror = () => { if (!cancelled) setLoaded(true); };
    img.src = `/api/products/${productId}/thumb`;
    return () => { cancelled = true; };
  }, [productId]);

  return (
    <div className="w-11 h-11 bg-ash-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-contain" />
      ) : loaded ? (
        <span className="text-base">⛳</span>
      ) : (
        <span className="text-[10px] text-ash-gray-300">⏳</span>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadCategories = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem("admin_cats");
      if (cached) { setCategories(JSON.parse(cached)); return; }
      const res = await fetch("/api/products?page=1&pageSize=1");
      const data = await res.json();
      if (data.categories) { setCategories(data.categories); sessionStorage.setItem("admin_cats", JSON.stringify(data.categories)); }
    } catch {}
  }, []);

  const fetchData = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${pg}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCategories(); fetchData(1); }, [fetchData, loadCategories]);

  const catMap = new Map(categories.map((c: any) => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-[22px] font-bold tracking-tight">商品管理</h1><p className="text-[13px] text-ash-gray-400 mt-0.5">{total} 件商品</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData(page)} disabled={loading} className="p-2 border border-ash-gray-200 hover:border-ash-black transition-colors"><RefreshCw className={`h-3.5 w-3.5 ${loading?"animate-spin":""}`}/></button>
          <Link href="/admin/products/new" className="flex items-center gap-2 bg-ash-black text-white text-[11px] tracking-wider uppercase px-5 py-2.5 font-medium hover:bg-ash-gray-800 transition-all"><Plus className="h-3.5 w-3.5"/> 新增商品</Link>
        </div>
      </div>

      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-ash-gray-50"><th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">商品</th><th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">分類</th><th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">價格</th><th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">庫存</th><th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">狀態</th><th className="text-right px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">操作</th></tr></thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ThumbCell productId={p.id} />
                    <div><p className="text-[13px] font-medium truncate max-w-[200px]">{p.name}</p><p className="text-[10px] text-ash-gray-400">{p.brand||"—"}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[13px] text-ash-gray-600">{catMap.get(p.categoryId)||"—"}</td>
                <td className="px-5 py-3 text-[13px] font-bold">{formatTWD(Number(p.price))}</td>
                <td className="px-5 py-3 text-[13px]">{Number(p.stock)}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${Number(p.isActive)?"bg-green-50 text-green-700":"bg-ash-gray-100 text-ash-gray-500"}`}>{Number(p.isActive)?"上架中":"下架"}</span></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/products/${p.slug}`} className="p-1.5 hover:bg-ash-gray-50 rounded-lg"><Eye className="h-3.5 w-3.5 text-ash-gray-400"/></Link>
                    <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 hover:bg-ash-gray-50 rounded-lg"><Pencil className="h-3.5 w-3.5"/></Link>
                    <DeleteButton productId={p.id}/>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length===0 && <tr><td colSpan={6} className="px-5 py-20 text-center text-[13px] text-ash-gray-300">尚無商品，<Link href="/admin/products/new" className="text-ash-black underline">新增第一件商品</Link></td></tr>}
            {loading && <tr><td colSpan={6} className="px-5 py-16 text-center"><RefreshCw className="h-4 w-4 inline animate-spin text-ash-gray-400"/></td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => fetchData(page-1)} disabled={page<=1} className="p-2 border border-ash-gray-200 hover:border-ash-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4"/></button>
          <span className="text-[13px] text-ash-gray-500 px-3">第 {page} 頁 / 共 {totalPages} 頁</span>
          <button onClick={() => fetchData(page+1)} disabled={page>=totalPages} className="p-2 border border-ash-gray-200 hover:border-ash-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4"/></button>
        </div>
      )}
    </div>
  );
}
