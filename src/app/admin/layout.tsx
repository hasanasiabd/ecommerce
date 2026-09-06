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
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session =
    await getSession();

  /*
   * The internal Admin route must never
   * be directly exposed to normal visitors.
   *
   * Middleware controls access.
   */

  if (
    !session ||
    (session.role !== "ADMIN" &&
      session.role !== "DEVELOPER")
  ) {
    return children;
  }

  const developerPath =
    `/${process.env.DEVELOPER_PANEL_PATH || "developer-panel"}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card/70 p-5 lg:flex lg:flex-col">
          <div>
            <div className="mb-8 flex items-center gap-3 px-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <LayoutDashboard className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  MyShop
                </p>

                <h2 className="font-bold">
                  Admin Panel
                </h2>
              </div>
            </div>

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
                href="#"
                icon={PackageSearch}
                label="Products"
                disabled
              />

              <AdminNavItem
                href="#"
                icon={Boxes}
                label="Inventory"
                disabled
              />

              <AdminNavItem
                href="#"
                icon={ShoppingCart}
                label="Orders"
                disabled
              />

              <AdminNavItem
                href="#"
                icon={Users}
                label="Customers"
                disabled
              />

              <AdminNavItem
                href="#"
                icon={Settings}
                label="Settings"
                disabled
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

        <main className="min-w-0 flex-1">
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
  disabled = false,
}: {
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground/50">
        <Icon className="h-4 w-4" />
        {label}
        <span className="ml-auto text-[10px] uppercase tracking-wider">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-accent"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}