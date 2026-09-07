// FILE: src/app/admin/layout.tsx

import Link from "next/link";
import {
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
import {
  getAdminPanelPath,
  getDeveloperPanelPath,
} from "@/lib/env";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminMobileNavigation } from "@/components/admin-mobile-navigation";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session =
    await getSession();

  if (
    !session ||
    (
      session.role !== "ADMIN" &&
      session.role !== "DEVELOPER"
    )
  ) {
    return children;
  }

  const adminPath =
    getAdminPanelPath();

  const developerPath =
    getDeveloperPanelPath();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">

        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card/80 p-5 lg:flex lg:flex-col">
          <div>
            <Link
              href={adminPath}
              className="mb-8 flex items-center gap-3 px-2"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <LayoutDashboard className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  MyShop
                </p>

                <h1 className="font-bold">
                  Admin Panel
                </h1>
              </div>
            </Link>

            <nav className="space-y-1">
              <AdminNavItem
                href="/dashboard"
                icon={UserRound}
                label="Customer Panel"
              />

              <AdminNavItem
                href="/"
                icon={LayoutDashboard}
                label="Store Home"
              />

              <AdminNavItem
                href={`${adminPath}/products`}
                icon={PackageSearch}
                label="Products"
              />

              <AdminNavItem
                href={`${adminPath}/categories`}
                icon={Boxes}
                label="Categories"
              />

              <AdminNavItem
                href={`${adminPath}/inventory`}
                icon={Boxes}
                label="Inventory"
              />

              <AdminNavItem
                href={`${adminPath}/orders`}
                icon={ShoppingCart}
                label="Orders"
              />

              <AdminNavItem
                href={`${adminPath}/customers`}
                icon={Users}
                label="Customers"
              />

              <AdminNavItem
                href={`${adminPath}/settings`}
                icon={Settings}
                label="Settings"
              />

              {session.role ===
                "DEVELOPER" && (
                <AdminNavItem
                  href={developerPath}
                  icon={Code2}
                  label="Developer Panel"
                />
              )}
            </nav>
          </div>

          <div className="mt-auto border-t border-border pt-5">
            <ThemeToggle />

            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Role
              </p>

              <p className="mt-1 text-sm font-semibold">
                {session.role}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {session.email}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {/* Mobile / Tablet Header */}
          <div className="sticky top-0 z-40 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AdminMobileNavigation
                  adminPath={adminPath}
                  developerPath={
                    developerPath
                  }
                  isDeveloper={
                    session.role ===
                    "DEVELOPER"
                  }
                />

                <Link
                  href={adminPath}
                  className="min-w-0"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                    MyShop
                  </p>

                  <p className="truncate text-sm font-bold">
                    Admin Panel
                  </p>
                </Link>
              </div>

              <ThemeToggle />
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
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3
        rounded-xl px-4 py-3
        text-sm font-medium
        text-muted-foreground
        transition
        hover:bg-accent
        hover:text-foreground
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}