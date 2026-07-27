import { listAdminUsers } from "@/lib/turso-db";
import { AdminUsersTable } from "./AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: any[] = [];
  try {
    users = await listAdminUsers();
  } catch {
    // table might not exist yet
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">帳號管理</h1>
          <p className="text-[13px] text-ash-gray-400 mt-0.5">
            {users.length} 個管理帳號
          </p>
        </div>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
