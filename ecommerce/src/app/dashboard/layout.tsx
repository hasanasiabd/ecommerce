// FILE: src/app/dashboard/layout.tsx

import Link from "next/link";
import {
  ArrowLeft,
  Code2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath, getDeveloperPanelPath } from "@/lib/env";
import { ThemeToggle } from "@/components/theme-toggle";
import { CustomerNavigation } from "@/components/customer-navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const isAdmin =
    session.role === "ADMIN" ||
    session.role === "DEVELOPER";

  const isDeveloper =
    session.role === "DEVELOPER";

  const adminPath = isAdmin
    ? getAdminPanelPath()
    : null;

  const developerPath = isDeveloper
    ? getDeveloperPanelPath()
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card/80 p-5 lg:flex lg:flex-col">
          <div>
            <Link
              href="/"
              className="mb-8 flex items-center gap-3 px-2"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <ArrowLeft className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                  MyShop
                </p>

                <h1 className="font-bold">
                  Customer Panel
                </h1>
              </div>
            </Link>

            <CustomerNavigation />
          </div>

          <div className="mt-auto border-t border-border pt-5">
            <div className="mb-3">
              <ThemeToggle />
            </div>

            {adminPath && (
              <Link
                href={adminPath}
                className="mb-2 flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-500 transition hover:bg-indigo-500/20"
              >
                <ShieldCheck className="h-4 w-4" />
                Back to Admin Panel
              </Link>
            )}

            {developerPath && (
              <Link
                href={developerPath}
                className="mb-2 flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-500 transition hover:bg-violet-500/20"
              >
                <Code2 className="h-4 w-4" />
                Back to Developer Panel
              </Link>
            )}

            <Link
              href="/"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <form
              action="/api/auth/logout"
              method="POST"
            >
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-border bg-card/80 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  MyShop
                </p>

                <h2 className="font-bold">
                  Customer Panel
                </h2>
              </div>

              <ThemeToggle />
            </div>

            <div className="mt-4">
              <CustomerNavigation />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {adminPath && (
                <Link
                  href={adminPath}
                  className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-500"
                >
                  Admin Panel
                </Link>
              )}

              {developerPath && (
                <Link
                  href={developerPath}
                  className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-500"
                >
                  Developer Panel
                </Link>
              )}

              <form
                action="/api/auth/logout"
                method="POST"
              >
                <button
                  type="submit"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}