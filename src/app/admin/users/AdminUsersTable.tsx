"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Key, Shield, User as UserIcon,
  X, Check, Settings2, Package, ShoppingBag, Users,
} from "lucide-react";
import { UserForm } from "@/components/admin/UserForm";

interface User {
  id: string;
  username: string;
  name: string | null;
  role: string;
  permissions: string[];
  createdAt: string;
}

const PERMISSION_DEFS = [
  { key: "products", label: "商品管理", desc: "新增、編輯、刪除商品", icon: Package, color: "bg-ash-black" },
  { key: "orders", label: "訂單管理", desc: "查看與處理訂單狀態", icon: ShoppingBag, color: "bg-ash-gray-800" },
  { key: "users", label: "帳號管理", desc: "管理後台帳號與權限", icon: Users, color: "bg-ash-gray-600" },
];

function hasPerm(user: User, key: string): boolean {
  if (user.role === "superadmin") return true;
  return user.permissions?.includes(key) || false;
}

export function AdminUsersTable({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentRole = (session?.user as any)?.role || "admin";
  const currentUserId = (session?.user as any)?.id;
  const isSuperAdmin = currentRole === "superadmin";

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [formMode, setFormMode] = useState<"create" | "changePassword" | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [permissionsOpen, setPermissionsOpen] = useState<string | null>(null);
  const [permissionValues, setPermissionValues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {}
  };

  const openPermissions = (u: User) => {
    setPermissionsOpen(u.id);
    setPermissionValues(u.role === "superadmin" ? ["products", "orders", "users"] : [...(u.permissions || [])]);
  };

  const togglePerm = (key: string) => {
    setPermissionValues(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const savePermissions = async () => {
    if (!permissionsOpen) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${permissionsOpen}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: permissionValues }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === permissionsOpen ? { ...u, permissions: permissionValues } : u));
        setPermissionsOpen(null);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "更新失敗");
      }
    } catch {
      setError("更新失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`確定要刪除帳號「${username}」？此操作無法復原。`)) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        router.refresh();
      } else {
        setError(data.error || "刪除失敗");
      }
    } catch {
      setError("刪除失敗");
    } finally {
      setDeleting(null);
    }
  };

  const handleFormDone = async () => {
    setFormMode(null);
    setSelectedUserId(null);
    await refresh();
    router.refresh();
  };

  return (
    <>
      {/* 当前登录用户信息 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-ash-gray-100 rounded-lg p-5 mb-6 flex items-center gap-4"
      >
        <div className={`w-10 h-10 ${isSuperAdmin ? "bg-ash-black" : "bg-ash-gray-600"} text-white flex items-center justify-center rounded-full shrink-0`}>
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{session?.user?.name || "Admin"}</p>
          <p className="text-[11px] text-ash-gray-400">
            目前登入帳號
            {isSuperAdmin && (
              <span className="ml-2 px-1.5 py-0.5 bg-ash-black text-white text-[9px] font-bold uppercase rounded">超級管理員</span>
            )}
          </p>
        </div>
        {!isSuperAdmin && (
          <button
            onClick={() => { setSelectedUserId(currentUserId || ""); setFormMode("changePassword"); }}
            className="text-[11px] text-ash-gray-500 hover:text-ash-black underline"
          >
            修改密碼
          </button>
        )}
      </motion.div>

      {/* 操作栏 */}
      {isSuperAdmin && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setFormMode("create")}
            className="flex items-center gap-2 bg-ash-black text-white text-[11px] tracking-wider uppercase px-5 py-2.5 font-medium hover:bg-ash-gray-800 transition-all active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" /> 新增帳號
          </button>
        </div>
      )}

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-red-600 bg-red-50 px-4 py-2 mb-4">{error}</motion.p>
      )}

      {/* 账号卡片网格 */}
      <div className="grid gap-4">
        {users.map((u, idx) => {
          const isMe = u.id === currentUserId;
          const isThisSuperAdmin = u.role === "superadmin";
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden hover:border-ash-gray-200 transition-all duration-300"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* 头像 */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm ${isThisSuperAdmin ? "bg-ash-black" : "bg-ash-gray-400"}`}>
                  {(u.name || u.username).charAt(0).toUpperCase()}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold font-mono">{u.username}</span>
                    {isMe && <span className="text-[9px] text-ash-gray-400 bg-ash-gray-100 px-1.5 py-0.5 rounded">我</span>}
                    {isThisSuperAdmin && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-ash-black text-white text-[9px] font-bold uppercase rounded">
                        <Shield className="h-2.5 w-2.5" /> 超級管理員
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-ash-gray-500 mt-0.5">{u.name || "—"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-ash-gray-400">{new Date(u.createdAt).toLocaleDateString("zh-TW")}</span>
                  </div>
                </div>

                {/* 权限标签 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PERMISSION_DEFS.map(def => {
                    const enabled = hasPerm(u, def.key);
                    return (
                      <span
                        key={def.key}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          enabled ? "bg-ash-gray-100 text-ash-gray-700" : "bg-ash-gray-50/50 text-ash-gray-300 line-through"
                        }`}
                      >
                        <def.icon className="h-2.5 w-2.5" />
                        {def.label}
                      </span>
                    );
                  })}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 shrink-0">
                  {isSuperAdmin && (
                    <button
                      onClick={() => openPermissions(u)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider uppercase font-medium border border-ash-gray-200 hover:border-ash-black hover:bg-ash-gray-50 rounded-lg transition-all"
                    >
                      <Settings2 className="h-3 w-3" /> 編輯權限
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => { setSelectedUserId(u.id); setFormMode("changePassword"); }}
                      className="p-1.5 hover:bg-ash-gray-50 rounded-lg transition-colors"
                      title="修改密碼"
                    >
                      <Key className="h-3.5 w-3.5 text-ash-gray-400" />
                    </button>
                  )}
                  {isSuperAdmin && !isMe && (
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={deleting === u.id}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="刪除帳號"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {users.length === 0 && (
          <div className="bg-white border border-ash-gray-50 rounded-lg p-16 text-center text-[13px] text-ash-gray-300">
            尚無管理帳號
          </div>
        )}
      </div>

      {/* 权限编辑面板 */}
      <AnimatePresence>
        {permissionsOpen && (() => {
          const targetUser = users.find(u => u.id === permissionsOpen);
          if (!targetUser) return null;
          const isTargetSuper = targetUser.role === "superadmin";
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] bg-black/50"
                onClick={() => setPermissionsOpen(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed inset-x-4 top-[10%] z-[81] mx-auto max-w-md bg-white shadow-2xl rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-ash-gray-100 bg-ash-gray-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">編輯權限</h3>
                      {isTargetSuper && (
                        <span className="px-1.5 py-0.5 bg-ash-black text-white text-[9px] font-bold uppercase rounded">
                          <Shield className="h-2.5 w-2.5 inline mr-0.5" /> 超級管理員
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ash-gray-400 mt-0.5">
                      {targetUser.name || targetUser.username}
                    </p>
                  </div>
                  <button
                    onClick={() => setPermissionsOpen(null)}
                    className="p-1.5 hover:bg-ash-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-ash-gray-400" />
                  </button>
                </div>

                {/* Permission list */}
                <div className="p-6 space-y-1">
                  {isTargetSuper ? (
                    <div className="text-center py-8">
                      <Shield className="h-10 w-10 text-ash-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-ash-gray-500">超級管理員擁有所有權限</p>
                      <p className="text-[11px] text-ash-gray-400 mt-1">無需調整</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-ash-gray-400 font-medium mb-4 pl-1">
                        勾選要授予的權限
                      </p>
                      {PERMISSION_DEFS.map(def => {
                        const checked = permissionValues.includes(def.key);
                        return (
                          <motion.button
                            key={def.key}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => togglePerm(def.key)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border-2 transition-all duration-200 text-left ${
                              checked
                                ? "border-ash-black bg-ash-gray-50/50"
                                : "border-transparent hover:border-ash-gray-200 hover:bg-ash-gray-50/30"
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${checked ? def.color + " text-white" : "bg-ash-gray-100 text-ash-gray-400"}`}>
                              <def.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className={`text-[13px] font-medium ${checked ? "text-ash-black" : "text-ash-gray-500"}`}>
                                {def.label}
                              </p>
                              <p className="text-[10px] text-ash-gray-400 mt-0.5">{def.desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-ash-black border-ash-black" : "border-ash-gray-300"}`}>
                              {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ash-gray-100 bg-ash-gray-50/30">
                  <button
                    onClick={() => setPermissionsOpen(null)}
                    className="px-5 py-2 text-[11px] tracking-wider text-ash-gray-500 hover:text-ash-black font-medium transition-colors"
                  >
                    取消
                  </button>
                  {!isTargetSuper && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={savePermissions}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-ash-black text-white text-[11px] tracking-wider uppercase font-bold hover:bg-ash-gray-800 transition-colors disabled:opacity-60 rounded-lg"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {saving ? "儲存中..." : "儲存"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Modal forms */}
      {formMode && (
        <UserForm
          mode={formMode}
          userId={selectedUserId || undefined}
          onDone={handleFormDone}
          onClose={() => { setFormMode(null); setSelectedUserId(null); }}
        />
      )}
    </>
  );
}
