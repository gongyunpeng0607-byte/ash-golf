"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const displayImages = images.length > 0 ? images : [];

  const prev = () => setActiveIndex(i => (i === 0 ? displayImages.length - 1 : i - 1));
  const next = () => setActiveIndex(i => (i === displayImages.length - 1 ? 0 : i + 1));

  return (
    <div>
      {/* Main image with arrow nav */}
      <div className="relative aspect-square bg-ash-gray-100 overflow-hidden mb-3 group/gallery rounded-lg">
        {displayImages.length > 0 ? (
          <>
            <img
              src={displayImages[activeIndex]}
              alt={productName}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            />

            {/* 点击放大提示 */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 right-3 p-2.5 bg-black/50 text-white rounded-full opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/70"
              title="點擊放大查看"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* 左右箭头 */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2.5 rounded-full shadow transition-all opacity-0 group-hover/gallery:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2.5 rounded-full shadow transition-all opacity-0 group-hover/gallery:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* 计数器 */}
            <span className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] px-2.5 py-1 rounded-full">
              {activeIndex + 1} / {displayImages.length}
            </span>

            {/* 可点区域指示 */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity">
              <span className="bg-black/60 text-white text-xs px-4 py-2 rounded-full tracking-wider">點擊放大查看</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🏌️</div>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(displayImages.length, 5)}, 1fr)` }}>
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square bg-ash-gray-50 overflow-hidden border-2 transition-all rounded ${
                i === activeIndex
                  ? "border-ash-black scale-105 shadow-md"
                  : "border-transparent hover:border-ash-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={displayImages}
        initialIndex={activeIndex}
        productName={productName}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
