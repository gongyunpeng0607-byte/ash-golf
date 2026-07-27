"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, LogIn } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 读取 Auth.js 重定向回来的错误参数
  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam) {
      if (errParam === "CredentialsSignin") {
        setError("帳號或密碼錯誤，請重試");
      } else {
        setError(`登入失敗：${errParam}`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // redirect: true — 成功时 Auth.js 直接 302 跳转，省掉一次客户端往返
    // 失败时 Auth.js 302 回到 /login?error=CredentialsSignin
    await signIn("credentials", {
      username,
      password,
      redirect: true,
      callbackUrl,
    });
    // 成功时不会执行到这里（已跳转）
    // 失败时页面会刷新，这里的 loading 已不重要
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-sm"
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <h1 className="text-2xl tracking-[0.15em] font-bold text-ash-black">
          ASH GOLF
        </h1>
        <p className="text-[11px] tracking-[0.2em] uppercase text-ash-gray-400 mt-2">
          Admin Console
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ash-gray-100 p-8 space-y-5"
      >
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium">
            帳號
          </label>
          <div className="flex items-center gap-3 border border-ash-gray-200 px-3 py-2.5 focus-within:border-ash-black transition-colors">
            <User className="h-3.5 w-3.5 text-ash-gray-400 shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入帳號"
              required
              autoComplete="username"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-ash-gray-300"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium">
            密碼
          </label>
          <div className="flex items-center gap-3 border border-ash-gray-200 px-3 py-2.5 focus-within:border-ash-black transition-colors">
            <Lock className="h-3.5 w-3.5 text-ash-gray-400 shrink-0" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              required
              autoComplete="current-password"
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-ash-gray-300"
            />
          </div>
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
          className="flex items-center justify-center gap-2 w-full bg-ash-black text-white text-xs tracking-[0.15em] uppercase py-3.5 font-bold hover:bg-ash-gray-800 transition-colors disabled:opacity-60"
        >
          <LogIn className="h-3.5 w-3.5" />
          {loading ? "登入中..." : "登入"}
        </button>
      </form>

      <p className="text-center text-[11px] text-ash-gray-300 mt-6">
        &copy; {new Date().getFullYear()} ASH GOLF. ALL RIGHTS RESERVED.
      </p>
    </motion.div>
  );
}
