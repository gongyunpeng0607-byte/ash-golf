import Link from "next/link";
import { getProducts, getCategories } from "@/lib/turso-db";
import { formatTWD } from "@/lib/format";
import { Plus, Pencil, Eye } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

function getFirstImage(imagesJson: string): string | null {
  try { const arr = JSON.parse(imagesJson); return arr[0] || null; } catch { return null; }
}

export default async function AdminProductsPage() {
  const [{ products }, categories] = await Promise.all([
    getProducts({ where: "1=1", orderBy: "createdAt DESC", take: 100 }),
    getCategories(),
  ]);

  const catMap = new Map((categories as any[]).map(c => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div><h1 className="text-[22px] font-bold tracking-tight">商品管理</h1><p className="text-[13px] text-ash-gray-400 mt-0.5">{products.length} 件商品</p></div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-ash-black text-white text-[11px] tracking-wider uppercase px-5 py-2.5 font-medium hover:bg-ash-gray-800 transition-all active:scale-[0.98]"><Plus className="h-3.5 w-3.5"/> 新增商品</Link>
      </div>
      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-ash-gray-50"><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">商品</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">分類</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">價格</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">庫存</th><th className="text-left px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">狀態</th><th className="text-right px-5 py-3.5 text-[10px] tracking-[0.12em] uppercase text-ash-gray-400 font-medium">操作</th></tr></thead>
          <tbody>
            {products.map((p: any) => {
              const img = getFirstImage(p.images || "[]");
              return (
                <tr key={p.id} className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 bg-ash-gray-100 rounded-lg overflow-hidden shrink-0">
                        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🏌️</div>}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium truncate max-w-[200px]">{p.name}</p>
                        <p className="text-[10px] text-ash-gray-400">{p.brand||"—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ash-gray-600">{catMap.get(p.categoryId)||"—"}</td>
                  <td className="px-5 py-4 text-[13px] font-bold">{formatTWD(Number(p.price))}</td>
                  <td className="px-5 py-4 text-[13px]">{Number(p.stock)}</td>
                  <td className="px-5 py-4"><span className={`px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-medium rounded-full ${Number(p.isActive)?"bg-green-50 text-green-700":"bg-ash-gray-100 text-ash-gray-500"}`}>{Number(p.isActive)?"上架中":"下架"}</span></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${p.slug}`} className="p-2 hover:bg-ash-gray-50 rounded-lg"><Eye className="h-3.5 w-3.5 text-ash-gray-400"/></Link>
                      <Link href={`/admin/products/${p.id}/edit`} className="p-2 hover:bg-ash-gray-50 rounded-lg"><Pencil className="h-3.5 w-3.5"/></Link>
                      <DeleteButton productId={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length===0&&<tr><td colSpan={6} className="px-5 py-20 text-center text-[13px] text-ash-gray-300">尚無商品，<Link href="/admin/products/new" className="text-ash-black underline underline-offset-4">新增第一件商品</Link></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
