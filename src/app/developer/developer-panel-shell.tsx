// FILE: src/app/developer/developer-panel-shell.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import {
  MobileDrawer,
  type MobileDrawerItem,
} from "@/components/mobile-drawer";
import { ThemeToggle } from "@/components/theme-toggle";

interface DeveloperPanelShellProps {
  children: ReactNode;
  developerPath: string;
  adminPath: string;
}

export function DeveloperPanelShell({
  children,
  developerPath,
  adminPath,
}: DeveloperPanelShellProps) {
  const pathname = usePathname();

  const [basePath, adminManagementPath] = [
    developerPath,
    `${developerPath}/admins`,
  ];

  const mobileItems: MobileDrawerItem[] = [
    {
      href: basePath,
      label: "Developer Panel",
      icon: Code2,
    },
    {
      href: adminManagementPath,
      label: "Administrators",
      icon: ShieldCheck,
    },
    {
      href: adminPath,
      label: "Admin Panel",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard",
      label: "Customer Panel",
      icon: UserRound,
    },
    {
      href: "/",
      label: "Store Home",
      icon: Store,
    },
  ];

  const isActive = (href: string) =>
    pathname === href ||
    (href !== basePath && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card/95 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-border px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Code2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              MyShop
            </p>
            <p className="truncate text-base font-bold">
              Developer Console
            </p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>

          <div className="space-y-1.5">
            <PanelLink
              href={basePath}
              icon={Code2}
              label="Developer Panel"
              active={isActive(basePath)}
            />

            <PanelLink
              href={adminManagementPath}
              icon={ShieldCheck}
              label="Administrators"
              active={isActive(adminManagementPath)}
            />
          </div>

          <div className="my-5 border-t border-border" />

          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Panels
          </p>

          <div className="space-y-1.5">
            <PanelLink
              href={adminPath}
              icon={LayoutDashboard}
              label="Admin Panel"
              active={false}
            />

            <PanelLink
              href="/dashboard"
              icon={UserRound}
              label="Customer Panel"
              active={false}
            />

            <PanelLink
              href="/"
              icon={Store}
              label="Store Home"
              active={false}
            />
          </div>
        </nav>

        <div className="shrink-0 border-t border-border p-4">
          <LogoutButton className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60">
            <LogOut className="h-4 w-4" />
            Logout
          </LogoutButton>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <MobileDeveloperNavigation
                items={mobileItems}
              />

              <div className="min-w-0 lg:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                  MyShop
                </p>
                <p className="truncate text-sm font-bold">
                  Developer Console
                </p>
              </div>

              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-semibold">
                  {pathname === adminManagementPath
                    ? "Administrator Management"
                    : "Developer Dashboard"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />

              <LogoutButton className="hidden h-10 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex">
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">Logout</span>
              </LogoutButton>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function PanelLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition",
        active
          ? "bg-indigo-500/10 text-indigo-500"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      ].join(" ")}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function MobileDeveloperNavigation({
  items,
}: {
  items: MobileDrawerItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open developer navigation"
        aria-expanded={open}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Developer Console"
        subtitle="MyShop"
        items={items}
      />
    </>
  );
}
