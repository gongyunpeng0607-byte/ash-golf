"use client";

import { useState, useRef } from "react";
import { X, Plus, Upload, Loader2 } from "lucide-react";

export function ImageUpload({ value, onChange }: { value: string; onChange: (urls: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentImages = (() => { try { return JSON.parse(value || "[]") as string[]; } catch { return []; } })();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await uploadFiles(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;
    await uploadFiles(Array.from(fileList));
  };

  const uploadFiles = async (fileArray: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach(f => formData.append("files", f));

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && data.urls?.length > 0) {
        const all = [...currentImages, ...data.urls];
        onChange(JSON.stringify(all));
      } else {
        alert(data.error || "上傳失敗");
      }
    } catch {
      alert("上傳失敗，請檢查網路");
    } finally {
      setUploading(false);
    }
  };

  const remove = (i: number) => {
    const all = [...currentImages];
    all.splice(i, 1);
    onChange(JSON.stringify(all));
  };

  return (
    <div className="space-y-4">
      {/* 现有图片 */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {currentImages.map((url, i) => (
            <div key={i} className="relative aspect-square bg-ash-gray-50 rounded-lg overflow-hidden group border border-ash-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => remove(i)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all" title="刪除"><X className="h-3 w-3" /></button>
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">{i + 1} / {currentImages.length}</span>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ash-gray-200 hover:border-ash-black rounded-lg p-8 cursor-pointer transition-colors"
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-ash-black animate-spin" />
            <span className="text-xs text-ash-gray-400">上傳中...</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-ash-gray-300" />
            <span className="text-xs text-ash-gray-500 font-medium">點擊選擇圖片 或 拖曳到這裡</span>
            <span className="text-[10px] text-ash-gray-400">支援 JPG / PNG / WebP，單檔 3MB 以內</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      <p className="text-[10px] text-ash-gray-400">也可以貼圖片網址：</p>
      <UrlAdder onAdd={(url) => { const all = [...currentImages, url]; onChange(JSON.stringify(all)); }} />
    </div>
  );
}

function UrlAdder({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");

  const add = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http")) { alert("請輸入完整圖片連結"); return; }
    onAdd(trimmed);
    setUrl("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder="https://..."
        className="flex-1 bg-ash-gray-50 border-0 px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-ash-black rounded-lg"
      />
      <button onClick={add} className="px-4 py-2.5 bg-ash-black text-white text-[10px] tracking-wider uppercase font-bold hover:bg-ash-gray-800 rounded-lg"><Plus className="h-3 w-3" /></button>
    </div>
  );
}
