"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Box,
  ShoppingBag,
  X,
  LogOut,
  Home,
  Users,
  Truck,
} from "lucide-react";
import { signOut } from "next-auth/react";

const baseLinks = [
  { href: "/admin", label: "儀表板", icon: LayoutDashboard },
  { href: "/admin/products", label: "商品管理", icon: Box },
  { href: "/admin/orders", label: "訂單管理", icon: ShoppingBag },
  { href: "/admin/shipments", label: "發貨管理", icon: Truck },
];

const superAdminLinks = [
  { href: "/admin/users", label: "帳號管理", icon: Users },
];

export function MobileAdminNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === "superadmin";

  const links = isSuperAdmin
    ? [...baseLinks, ...superAdminLinks]
    : baseLinks;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-white z-[71] shadow-2xl md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-ash-gray-100">
              <div>
                <span className="text-[15px] tracking-[0.08em] font-bold">
                  ASH GOLF
                </span>
                <p className="text-[9px] tracking-[0.2em] text-ash-gray-400 uppercase mt-0.5">
                  Admin Console
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-ash-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-ash-gray-500" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4">
              {links.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg mb-0.5 transition-all duration-200 ${
                      active
                        ? "bg-ash-black text-white"
                        : "text-ash-gray-600 hover:bg-ash-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-ash-gray-100 space-y-1">
              <Link
                href="/"
                onClick={onClose}
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
