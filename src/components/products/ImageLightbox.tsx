"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  productName: string;
  open: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, productName, open, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setZoom(false);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, initialIndex]);

  const prev = useCallback(() => setIndex(i => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setIndex(i => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, prev, next]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
    setPosition({ x, y });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 text-white shrink-0">
            <span className="text-xs tracking-wider text-white/60">{index + 1} / {images.length}</span>
            <span className="text-sm font-medium">{productName}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(!zoom)}
                className="p-2 hover:bg-white/10 transition-colors"
                title={zoom ? "縮小" : "放大"}
              >
                {zoom ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            {/* Prev/Next */}
            <button onClick={prev} className="absolute left-4 z-10 p-3 hover:bg-white/10 transition-colors text-white"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={next} className="absolute right-4 z-10 p-3 hover:bg-white/10 transition-colors text-white"><ChevronRight className="h-6 w-6" /></button>

            {/* Image */}
            <div
              className="w-full h-full flex items-center justify-center p-12"
              onClick={!zoom ? next : undefined}
              onMouseMove={handleMouseMove}
              style={{ cursor: zoom ? "move" : "pointer" }}
            >
              <motion.img
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={images[index]}
                alt={productName}
                className="max-w-full max-h-full object-contain select-none"
                style={zoom ? {
                  transform: `scale(2.5) translate(${position.x}px, ${position.y}px)`,
                  transition: "transform 0.1s ease-out",
                } : {
                  transform: "scale(1)",
                  transition: "transform 0.3s ease-out",
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="shrink-0 p-4 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setIndex(i); setZoom(false); }}
                className={`w-16 h-16 overflow-hidden border-2 transition-all ${
                  i === index ? "border-white scale-110" : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
