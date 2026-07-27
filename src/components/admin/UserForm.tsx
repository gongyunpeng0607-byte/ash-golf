"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Key } from "lucide-react";

interface UserFormProps {
  mode: "create" | "changePassword";
  userId?: string;
  onDone: () => void;
  onClose: () => void;
}

export function UserForm({ mode, userId, onDone, onClose }: UserFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title =
    mode === "create" ? "新增帳號" : "修改密碼";
  const btnLabel =
    mode === "create" ? "建立帳號" : "更新密碼";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "create") {
        if (!username.trim() || username.trim().length < 2) {
          setError("帳號至少需要 2 個字元");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("密碼至少需要 6 個字元");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password,
            name: displayName.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "建立失敗");
      } else {
        if (password.length < 6) {
          setError("密碼至少需要 6 個字元");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "更新失敗");
      }

      onDone();
    } catch (err: any) {
      setError(err.message || "操作失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-sm p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-ash-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-ash-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "create" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium">
                    帳號
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="輸入帳號"
                    required
                    className="w-full border border-ash-gray-200 px-3 py-2.5 text-sm outline-none focus:border-ash-black transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium">
                    使用人姓名
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="輸入使用人姓名（選填）"
                    className="w-full border border-ash-gray-200 px-3 py-2.5 text-sm outline-none focus:border-ash-black transition-colors"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium">
                {mode === "create" ? "密碼" : "新密碼"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "create" ? "輸入密碼（至少 6 位）" : "輸入新密碼（至少 6 位）"}
                required
                className="w-full border border-ash-gray-200 px-3 py-2.5 text-sm outline-none focus:border-ash-black transition-colors"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-red-600 bg-red-50 px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-ash-black text-white text-xs tracking-[0.15em] uppercase py-3 font-bold hover:bg-ash-gray-800 transition-colors disabled:opacity-60"
            >
              {mode === "create" ? (
                <Plus className="h-3.5 w-3.5" />
              ) : (
                <Key className="h-3.5 w-3.5" />
              )}
              {loading ? "處理中..." : btnLabel}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
