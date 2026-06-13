"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";

// Canvas 压缩：最大 550px 宽，JPEG 质量 0.4 → ~20-50KB/张
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 550;
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        canvas.width = Math.round(w); canvas.height = Math.round(h);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.4));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ value, onChange }: { value: string; onChange: (urls: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentImages = (() => { try { return JSON.parse(value || "[]") as string[]; } catch { return []; } })();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await processFiles(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;
    await processFiles(Array.from(fileList));
  };

  const processFiles = async (fileArray: File[]) => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of fileArray) {
        if (file.size > 10 * 1024 * 1024) { alert(`${file.name} 超過10MB限制`); continue; }
        const dataUrl = await compressImage(file);
        urls.push(dataUrl);
      }
      onChange(JSON.stringify([...currentImages, ...urls]));
    } catch {
      alert("圖片處理失敗");
    } finally {
      setUploading(false);
    }
  };

  const remove = (i: number) => {
    const all = [...currentImages]; all.splice(i, 1); onChange(JSON.stringify(all));
  };

  return (
    <div className="space-y-4">
      {currentImages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {currentImages.map((url, i) => (
            <div key={i} className="relative aspect-square bg-ash-gray-50 rounded-lg overflow-hidden group border border-ash-gray-100">
              <img src={url} alt="" className="w-full h-full object-contain" />
              <button onClick={() => remove(i)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><X className="h-3 w-3" /></button>
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">{i + 1}/{currentImages.length}</span>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ash-gray-200 hover:border-ash-black rounded-lg p-8 cursor-pointer transition-colors"
      >
        {uploading ? (
          <><Loader2 className="h-8 w-8 text-ash-black animate-spin" /><span className="text-xs text-ash-gray-400">處理中...</span></>
        ) : (
          <><Upload className="h-8 w-8 text-ash-gray-300" /><span className="text-xs text-ash-gray-500 font-medium">點擊選擇圖片 或 拖曳到這裡</span><span className="text-[10px] text-ash-gray-400">支援 JPG/PNG/WebP，自動壓縮</span></>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}
