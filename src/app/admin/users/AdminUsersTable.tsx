"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Key } from "lucide-react";
import { UserForm } from "@/components/admin/UserForm";

interface User {
  id: string;
  username: string;
  name: string | null;
  createdAt: string;
}

export function AdminUsersTable({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [formMode, setFormMode] = useState<"create" | "changePassword" | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {}
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`確定要刪除帳號「${username}」？此操作無法復原。`)) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setFormMode("create")}
          className="flex items-center gap-2 bg-ash-black text-white text-[11px] tracking-wider uppercase px-5 py-2.5 font-medium hover:bg-ash-gray-800 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> 新增帳號
        </button>
      </div>

      {error && (
        <p className="text-[12px] text-red-600 bg-red-50 px-4 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ash-gray-50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-ash-gray-50">
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  帳號
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  名稱
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  建立時間
                </th>
                <th className="text-right px-5 py-3.5 text-[10px] font-medium text-ash-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-ash-gray-50 hover:bg-ash-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-4 text-[13px] font-mono font-medium">
                    {u.username}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ash-gray-600">
                    {u.name || "—"}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-ash-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("zh-TW")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setFormMode("changePassword");
                        }}
                        className="p-1.5 hover:bg-ash-gray-50 rounded-lg"
                        title="修改密碼"
                      >
                        <Key className="h-3.5 w-3.5 text-ash-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={deleting === u.id}
                        className="p-1.5 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="刪除帳號"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-16 text-center text-[13px] text-ash-gray-300"
                  >
                    尚無管理帳號
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal forms */}
      {formMode && (
        <UserForm
          mode={formMode}
          userId={selectedUserId || undefined}
          onDone={handleFormDone}
          onClose={() => {
            setFormMode(null);
            setSelectedUserId(null);
          }}
        />
      )}
    </>
  );
}
