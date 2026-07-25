"use client";

import { useEffect, useRef, useState } from "react";
import { X, Copy, ExternalLink, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINE_URL = "https://line.me/ti/p/3YdstG77NF";
const LINE_DEEPLINK = "line://ti/p/3YdstG77NF";

interface LINEQRModalProps {
  open: boolean;
  onClose: () => void;
  orderNo: string;
}

export function LINEQRModal({ open, onClose, orderNo }: LINEQRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    let cancelled = false;

    import("qrcode").then((QRCode) => {
      if (cancelled) return;
      QRCode.toCanvas(canvasRef.current, LINE_URL, {  
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrReady(true);
    }).catch(() => {
      // fallback: show QR via API image
      setQrReady(true);           
    });

    return () => { cancelled = true; };
  }, [open]);

  const handleOpenLine = () => {
    if (opening) return;
    setOpening(true);

    const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const fallbackDelay = isMobile ? 1200 : 400;

    const fallbackTimer = window.setTimeout(() => {
      window.open(LINE_URL, "_blank", "noopener,noreferrer");
      setOpening(false);
    }, fallbackDelay);

    try {
      window.location.href = LINE_DEEPLINK;
    } catch {
      window.open(LINE_URL, "_blank", "noopener,noreferrer");
      setOpening(false);
    }

    window.setTimeout(() => {
      window.clearTimeout(fallbackTimer);
      setOpening(false);
    }, fallbackDelay + 600);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LINE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-4 z-[61] m-auto w-full max-w-sm h-fit bg-white shadow-2xl p-8 text-center"
          >
            <button onClick={onClose} className="absolute top-3 right-3 p-2 hover:bg-ash-gray-50 transition-colors">
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold tracking-tight mb-1">訂單已成立</h2>
            <p className="text-xs text-ash-gray-400 mb-6 font-mono">#{orderNo}</p>

            {/* QR Code */}
            <div className="bg-[#fafafa] border border-ash-gray-100 p-6 mb-5">
              <div className="w-[200px] h-[200px] mx-auto bg-white flex items-center justify-center">
                {!qrReady && <div className="w-40 h-40 bg-ash-gray-100 animate-pulse" />}
                <canvas ref={canvasRef} className={`${qrReady ? "block" : "hidden"} w-full h-full`} />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-[13px] font-bold">掃描 QR Code 加入 LINE</span>
              </div>
              <p className="text-[11px] text-ash-gray-400 mt-1">客服將在 LINE 為您確認訂單</p>
            </div>

            {/* LINE info */}
            <div className="bg-[#06C755]/5 border border-[#06C755]/20 p-4 space-y-3">
              <p className="text-xs text-ash-gray-500">或複製連結加入</p>
              <div className="flex items-center gap-2 bg-white border border-ash-gray-200 p-2">
                <input
                  readOnly
                  value={LINE_URL}
                  className="flex-1 text-[10px] text-ash-gray-600 outline-none bg-transparent truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] tracking-wider uppercase px-3 py-1.5 bg-ash-black text-white font-medium hover:bg-ash-gray-800 transition-colors shrink-0"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "已複製" : "複製"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleOpenLine}
                disabled={opening}
                className="flex items-center justify-center gap-2 w-full bg-[#06C755] text-white text-xs tracking-wider uppercase py-3 font-bold hover:bg-[#05b34a] transition-colors disabled:opacity-70"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {opening ? "開啟中..." : "直接加入 LINE 好友"}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-ash-black text-white text-xs tracking-[0.12em] uppercase py-4 font-bold hover:bg-ash-gray-800 transition-colors mt-4"
            >
              我知道了
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
