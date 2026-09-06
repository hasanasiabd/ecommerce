// FILE: src/app/developer/page.tsx

import Link from "next/link";
import {
  ArrowRight,
  Code2,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import {
  getAdminPanelPath,
  getDeveloperPanelPath,
} from "@/lib/env";
import { ThemeToggle } from "@/components/theme-toggle";
import DeveloperLogin from "./developer-login";

export default async function DeveloperPage() {
  const session =
    await getSession();

  if (
    !session ||
    session.role !== "DEVELOPER"
  ) {
    return <DeveloperLogin />;
  }

  const adminPanelPath =
    getAdminPanelPath();

  const developerPanelPath =
    getDeveloperPanelPath();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Code2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                MyShop
              </p>

              <h1 className="text-xl font-bold">
                Developer Console
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />

            <Link
              href={adminPanelPath}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4" />
              Admin Panel
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
            >
              <UserRound className="h-4 w-4" />
              Customer Panel
            </Link>

            <form
              action="/api/auth/logout"
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <ShieldCheck className="h-4 w-4" />
              Developer Access
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, Developer
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              You have full system-level access to MyShop.
              Manage administrators now and access the
              advanced system controls as we build them.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href={`${developerPanelPath}/admins`}
            className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-500" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Administrator Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create, manage, disable, activate,
              reset and remove administrator accounts.
            </p>
          </Link>

          <Link
            href={adminPanelPath}
            className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-violet-500" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Admin Panel
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter the main store administration
              workspace using developer privileges.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <UserRound className="h-6 w-6" />
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-emerald-500" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Customer Panel
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Open the normal customer experience with
              your developer account.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}