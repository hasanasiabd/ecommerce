// FILE: src/components/admin-mobile-navigation.tsx

"use client";

import { useCallback, useState } from "react";
import {
  BarChart3,
  Boxes,
  Code2,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import { MobileDrawer, type MobileDrawerItem } from "@/components/mobile-drawer";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminMobileNavigation({
  adminPath,
  developerPath,
  isDeveloper,
}: {
  adminPath: string;
  developerPath: string;
  isDeveloper: boolean;
}) {
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);

  const items: MobileDrawerItem[] = [
    { href: adminPath, label: "Dashboard", icon: LayoutDashboard },
    { href: `${adminPath}/products`, label: "Products", icon: PackageSearch },
    { href: `${adminPath}/categories`, label: "Categories", icon: Boxes },
    { href: `${adminPath}/inventory`, label: "Inventory", icon: Boxes },
    { href: `${adminPath}/orders`, label: "Orders", icon: ShoppingCart },
    { href: `${adminPath}/customers`, label: "Customers", icon: Users },
    { href: `${adminPath}/reports`, label: "Reports", icon: BarChart3 },
    { href: `${adminPath}/analysis`, label: "Analysis", icon: BarChart3 },
    { href: `${adminPath}/settings`, label: "Settings", icon: Settings },
  ];

  if (isDeveloper) {
    items.push({ href: developerPath, label: "Developer Panel", icon: Code2 });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
        aria-expanded={open}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileDrawer
        open={open}
        onClose={handleClose}
        title="Admin Panel"
        subtitle="MyShop"
        items={items}
        footer={
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton className="inline-flex flex-1 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                Logout
              </LogoutButton>
            </div>
            <p className="text-center text-xs text-muted-foreground">MyShop Admin</p>
          </div>
        }
      />
    </>
  );
}
