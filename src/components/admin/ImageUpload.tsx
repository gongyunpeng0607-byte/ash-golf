"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (urls: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const currentImages = (() => {
    try { return JSON.parse(value || "[]") as string[]; } catch { return []; }
  })();

  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      const all = [...currentImages, ...data.urls];
      onChange(JSON.stringify(all));
    }
    setUploading(false);
  }, [currentImages, onChange]);

  const removeImage = (index: number) => {
    const all = [...currentImages];
    all.splice(index, 1);
    onChange(JSON.stringify(all));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver ? "border-ash-black bg-ash-gray-50" : "border-ash-gray-200 hover:border-ash-gray-400"
        }`}
        onClick={() => document.getElementById("img-upload-input")?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-ash-gray-400" />
        <p className="text-sm font-medium text-ash-black">{uploading ? "上傳中..." : "點擊或拖曳上傳圖片"}</p>
        <p className="text-[11px] text-ash-gray-400 mt-1">支援 JPG / PNG / WebP</p>
        <input
          id="img-upload-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {currentImages.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {currentImages.map((url, i) => (
            <div key={i} className="relative aspect-square bg-ash-gray-50 rounded-lg overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
