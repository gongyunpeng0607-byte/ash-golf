"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Home,
  ChevronRight,
  Menu,
  Users,
} from "lucide-react";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const links = [
    { href: "/admin", label: "儀表板", icon: LayoutDashboard },
    { href: "/admin/products", label: "商品管理", icon: Package },
    { href: "/admin/orders", label: "訂單管理", icon: ShoppingBag },
    { href: "/admin/users", label: "帳號管理", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex">
      {/* Sidebar - desktop only */}
      <aside className="w-[200px] bg-white border-r border-ash-gray-100 shrink-0 hidden md:flex flex-col">
        <div className="px-6 py-7">
          <Link
            href="/admin"
            className="text-[15px] tracking-[0.08em] font-bold block"
          >
            ASH GOLF
          </Link>
          <p className="text-[9px] tracking-[0.2em] text-ash-gray-400 uppercase mt-0.5">
            Admin Console
          </p>
        </div>

        <nav className="flex-1 px-3">
          {links.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg mb-0.5 transition-all duration-200 ${
                  active
                    ? "bg-ash-black text-white"
                    : "text-ash-gray-600 hover:bg-ash-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3 w-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ash-gray-100 space-y-1">
          {session?.user && (
            <p className="px-3 py-1.5 text-[10px] text-ash-gray-400 tracking-wider">
              {session.user.name}
            </p>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-ash-gray-400 hover:text-ash-black rounded-lg transition-colors"
          >
            <Home className="h-3.5 w-3.5" /> 返回前台
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-ash-gray-400 hover:text-ash-black rounded-lg transition-colors w-full text-left"
          >
            <LogOut className="h-3.5 w-3.5" /> 退出登入
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 bg-white border-b z-40 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-1.5 -ml-1 hover:bg-ash-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="text-sm tracking-wider font-bold">
          ASH GOLF
        </Link>
        <span className="text-[9px] text-ash-gray-400 tracking-wider ml-auto">
          Admin
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8 pt-16 md:pt-8 max-w-[1200px] min-w-0">
        {children}
      </div>

      {/* Mobile nav drawer */}
      <MobileAdminNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
