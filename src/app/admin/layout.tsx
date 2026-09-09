// FILE: src/app/admin/layout.tsx

import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Code2,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShoppingCart,
  UserRound,
  Users,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath, getDeveloperPanelPath } from "@/lib/env";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminMobileNavigation } from "@/components/admin-mobile-navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DEVELOPER")) {
    return children;
  }

  const adminPath = getAdminPanelPath();
  const developerPath = getDeveloperPanelPath();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card/80 p-5 lg:flex lg:flex-col">
          <div>
            <Link href={adminPath} className="mb-8 flex items-center gap-3 px-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">MyShop</p>
                <h1 className="font-bold">Admin Panel</h1>
              </div>
            </Link>

            <nav className="space-y-1">
              <AdminNavItem href={adminPath} icon={LayoutDashboard} label="Dashboard" />
              <AdminNavItem href={`${adminPath}/products`} icon={PackageSearch} label="Products" />
              <AdminNavItem href={`${adminPath}/categories`} icon={Boxes} label="Categories" />
              <AdminNavItem href={`${adminPath}/inventory`} icon={Boxes} label="Inventory" />
              <AdminNavItem href={`${adminPath}/orders`} icon={ShoppingCart} label="Orders" />
              <AdminNavItem href={`${adminPath}/customers`} icon={Users} label="Customers" />
              <AdminNavItem href={`${adminPath}/reports`} icon={BarChart3} label="Reports" />
              <AdminNavItem href={`${adminPath}/analysis`} icon={BarChart3} label="Analysis" />
              <AdminNavItem href={`${adminPath}/settings`} icon={Settings} label="Settings" />
              {session.role === "DEVELOPER" ? (
                <AdminNavItem href={developerPath} icon={Code2} label="Developer Panel" />
              ) : null}
            </nav>
          </div>

          <div className="mt-auto border-t border-border pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle />
              <LogoutButton className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                Logout
              </LogoutButton>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Role</p>
              <p className="mt-1 text-sm font-semibold">{session.role}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{session.email}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="hidden items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur-xl lg:flex">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">MyShop</p>
              <p className="text-sm font-bold">Admin Panel</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`${adminPath}/reports`}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </Link>
              <Link
                href={`${adminPath}/analysis`}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2.5 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-500/20"
              >
                <BarChart3 className="h-4 w-4" />
                Analysis
              </Link>
            </div>
          </header>

          <div className="sticky top-0 z-40 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-3">
              <AdminMobileNavigation
                adminPath={adminPath}
                developerPath={developerPath}
                isDeveloper={session.role === "DEVELOPER"}
              />
              <Link href={adminPath} className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">MyShop</p>
                <p className="truncate text-sm font-bold">Admin Panel</p>
              </Link>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
