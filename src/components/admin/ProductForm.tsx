"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import type { Category, Product } from "@/types";

interface ProductFormProps { categories: Category[]; product?: Product | null; }

const F = "w-full bg-gray-50 border-0 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ash-black/10 focus:bg-white transition-all rounded-lg";
const L = "block text-[11px] tracking-[0.08em] text-ash-gray-500 mb-1.5 font-medium";
const SEL = "w-full bg-gray-50 border-0 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ash-black/10 focus:bg-white transition-all rounded-lg cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_12px_center] pr-10";

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: product?.name || "", slug: product?.slug || "", description: product?.description || "",
    specs: product?.specs || "", price: product?.price?.toString() || "",
    comparePrice: product?.comparePrice?.toString() || "", stock: product?.stock?.toString() || "0",
    isActive: product?.isActive ?? true, isFeatured: product?.isFeatured ?? false,
    images: product?.images || "[]", categoryId: product?.categoryId || categories[0]?.id || "",
    brand: product?.brand || "", tags: product?.tags || "[]",
  });

  const update = (f: string, v: string | boolean) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    const { slug, ...rest } = form;
    const body = isEdit ? { ...rest, price: parseInt(form.price) || 0, comparePrice: form.comparePrice ? parseInt(form.comparePrice) : null, stock: parseInt(form.stock) || 0 } : { ...rest, slug, price: parseInt(form.price) || 0, comparePrice: form.comparePrice ? parseInt(form.comparePrice) : null, stock: parseInt(form.stock) || 0 };
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { router.push("/admin/products"); router.refresh(); }
      else { setError(result.error || "儲存失敗"); setSaving(false); }
    } catch { setError("網路錯誤"); setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && <div className="bg-red-50 text-red-600 text-sm px-5 py-3.5 border border-red-100 rounded-lg">{error}</div>}

      {/* Basic info */}
      <div className="bg-white border border-ash-gray-50 rounded-xl p-6 lg:p-8">
        <h2 className="text-xs tracking-[0.15em] uppercase font-bold mb-6 flex items-center gap-2"><span className="w-1 h-4 bg-ash-black" /> 基本資訊</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div><label className={L}>商品名稱 *</label><input required className={F} value={form.name} onChange={e => update("name", e.target.value)} placeholder="TAYLORMADE STEALTH 2 DRIVER" /></div>
          {!isEdit && <div><label className={L}>網址 Slug *</label><input required className={F} value={form.slug} onChange={e => update("slug", e.target.value)} placeholder="taylormade-stealth-2" /></div>}
          <div className="sm:col-span-2"><label className={L}>商品描述 *</label><textarea required className={F + " resize-none"} value={form.description} onChange={e => update("description", e.target.value)} rows={4} placeholder="描述商品特色..." /></div>
        </div>
      </div>

      {/* Price & Stock */}
      <div className="bg-white border border-ash-gray-50 rounded-xl p-6 lg:p-8">
        <h2 className="text-xs tracking-[0.15em] uppercase font-bold mb-6 flex items-center gap-2"><span className="w-1 h-4 bg-ash-black" /> 價格與庫存</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div><label className={L}>售價 TWD *</label><input required type="number" className={F} value={form.price} onChange={e => update("price", e.target.value)} placeholder="18800" /></div>
          <div><label className={L}>原價</label><input type="number" className={F} value={form.comparePrice} onChange={e => update("comparePrice", e.target.value)} placeholder="22800" /></div>
          <div><label className={L}>庫存</label><input type="number" className={F} value={form.stock} onChange={e => update("stock", e.target.value)} placeholder="10" /></div>
        </div>
      </div>

      {/* Category & Brand */}
      <div className="bg-white border border-ash-gray-50 rounded-xl p-6 lg:p-8">
        <h2 className="text-xs tracking-[0.15em] uppercase font-bold mb-6 flex items-center gap-2"><span className="w-1 h-4 bg-ash-black" /> 分類與品牌</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div><label className={L}>分類 *</label>
            {categories.length > 0 ? (
              <select required className={SEL} value={form.categoryId} onChange={e => update("categoryId", e.target.value)}>
                <option value="" disabled>選擇分類</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <p className="text-[12px] text-amber-600 bg-amber-50 px-3 py-2.5 rounded-lg">尚無分類，請先在資料庫建立分類</p>
            )}
          </div>
          <div><label className={L}>品牌</label><input className={F} value={form.brand} onChange={e => update("brand", e.target.value)} placeholder="TAYLORMADE" /></div>
          <div><label className={L}>規格 JSON</label><input className={F} value={form.specs} onChange={e => update("specs", e.target.value)} placeholder='{"桿面":"9.0°"}' /></div>
        </div>
      </div>

      {/* Image upload */}
      <div className="bg-white border border-ash-gray-50 rounded-xl p-6 lg:p-8">
        <h2 className="text-xs tracking-[0.15em] uppercase font-bold mb-6 flex items-center gap-2"><span className="w-1 h-4 bg-ash-black" /> 商品圖片</h2>
        <ImageUpload value={form.images} onChange={v => update("images", v)} />
      </div>

      {/* Settings */}
      <div className="bg-white border border-ash-gray-50 rounded-xl p-6 lg:p-8">
        <h2 className="text-xs tracking-[0.15em] uppercase font-bold mb-6 flex items-center gap-2"><span className="w-1 h-4 bg-ash-black" /> 顯示設定</h2>
        <div className="flex gap-8 mb-5">
          <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => update("isActive", e.target.checked)} className="accent-black w-4 h-4" /><span className="text-sm">上架</span></label>
          <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => update("isFeatured", e.target.checked)} className="accent-black w-4 h-4" /><span className="text-sm">推薦</span></label>
        </div>
        <div><label className={L}>標籤 JSON</label><input className={F} value={form.tags} onChange={e => update("tags", e.target.value)} placeholder='["熱門","新品"]' /></div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-ash-black text-white text-xs tracking-[0.12em] uppercase px-8 py-3.5 font-bold hover:bg-ash-gray-800 disabled:opacity-50 transition-all duration-200 active:scale-[0.98] rounded-lg">
          <Save className="h-3.5 w-3.5" /> {saving ? "儲存中..." : isEdit ? "更新商品" : "建立商品"}
        </button>
        <button type="button" onClick={() => router.back()} className="flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-ash-gray-400 hover:text-ash-black px-6 py-3.5 font-medium transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> 取消
        </button>
      </div>
    </form>
  );
}
