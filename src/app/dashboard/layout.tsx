// src/app/dashboard/layout.tsx

"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "My Orders", href: "/dashboard/orders", icon: "📦" },
    { name: "Wishlist", href: "/dashboard/wishlist", icon: "❤️" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950 text-white flex-col md:flex-row">
      <aside className="flex flex-col justify-between w-full md:w-64 border-r border-gray-800 bg-gray-950 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">My Account</h2>
            <p className="text-xs text-gray-400 mt-1">Manage your profile and orders</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-800 space-y-2 mt-6">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white transition"
          >
            <span>🏠</span> Back to Home
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/40 transition text-left cursor-pointer"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}