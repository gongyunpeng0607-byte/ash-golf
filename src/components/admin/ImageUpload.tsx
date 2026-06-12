"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (urls: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const currentImages = (() => { try { return JSON.parse(value || "[]") as string[]; } catch { return []; } })();

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) { alert("請輸入完整圖片連結（https://...）"); return; }
    const all = [...currentImages, url];
    onChange(JSON.stringify(all));
    setUrlInput("");
    setShowInput(false);
  };

  const removeImage = (index: number) => {
    const all = [...currentImages];
    all.splice(index, 1);
    onChange(JSON.stringify(all));
  };

  return (
    <div className="space-y-4">
      {/* Current images */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {currentImages.map((url, i) => (
            <div key={i} className="relative aspect-square bg-ash-gray-50 rounded-lg overflow-hidden group border border-ash-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text x='50%' y='50%' text-anchor='middle' dy='.3em' font-size='40'>🏌️</text></svg>"; }} />
              <button onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"><X className="h-3 w-3" /></button>
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add URL */}
      {showInput ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="貼上圖片連結 https://..."
            className="flex-1 bg-ash-gray-50 border-0 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-ash-black transition-all rounded-lg"
          />
          <button onClick={addUrl} className="px-4 py-3 bg-ash-black text-white text-xs tracking-wider uppercase font-bold hover:bg-ash-gray-800 transition-colors rounded-lg">添加</button>
          <button onClick={() => setShowInput(false)} className="px-3 py-3 text-xs text-ash-gray-400 hover:text-ash-black">取消</button>
        </div>
      ) : (
        <button onClick={() => setShowInput(true)} className="flex items-center gap-2 text-xs text-ash-gray-500 hover:text-ash-black transition-colors border-2 border-dashed border-ash-gray-200 hover:border-ash-gray-400 rounded-lg p-4 w-full justify-center">
          <Plus className="h-3.5 w-3.5" /> 添加圖片連結
        </button>
      )}

      <p className="text-[10px] text-ash-gray-400">貼上圖片網址即可，支援任何 HTTPS 圖片連結（Imgur / Cloudinary / 自建圖床等）</p>
    </div>
  );
}
