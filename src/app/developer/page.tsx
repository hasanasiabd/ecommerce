// FILE: src/app/developer/page.tsx

import Link from "next/link";
import {
  ArrowRight,
  Code2,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import {
  getAdminPanelPath,
  getDeveloperPanelPath,
} from "@/lib/env";
import DeveloperLogin from "./developer-login";

export default async function DeveloperPage() {
  const session = await getSession();

  if (!session || session.role !== "DEVELOPER") {
    return <DeveloperLogin />;
  }

  const adminPanelPath = getAdminPanelPath();
  const developerPanelPath = getDeveloperPanelPath();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-card p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-500">
            <ShieldCheck className="h-4 w-4" />
            Developer Access
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Developer Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            You have full system-level access to MyShop. Manage administrator
            accounts and move between the application workspaces from the
            dedicated developer console.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href={`${developerPanelPath}/admins`}
          className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Administrator Management
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create, activate, disable, reset and remove administrator accounts.
          </p>
        </Link>

        <Link
          href={adminPanelPath}
          className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-violet-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">Admin Panel</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Open the main store administration workspace with developer access.
          </p>
        </Link>

        <Link
          href="/dashboard"
          className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <UserRound className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-emerald-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">Customer Panel</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Open the customer experience while keeping your developer session.
          </p>
        </Link>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Developer workspace</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This console is intentionally separate from the public storefront
              so administrative controls remain focused and uncluttered.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
