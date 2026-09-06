// FILE: src/app/admin/page.tsx

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Code2,
  LogOut,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import AdminLogin from "./admin-login";

export default async function AdminPage() {
  const session =
    await getSession();

  if (
    !session ||
    (session.role !== "ADMIN" &&
      session.role !== "DEVELOPER")
  ) {
    return <AdminLogin />;
  }

  const developerPath =
    `/${process.env.DEVELOPER_PANEL_PATH || "developer-panel"}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                MyShop
              </p>

              <h1 className="text-xl font-bold">
                Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ThemeToggle />

            {session.role ===
              "DEVELOPER" && (
              <Link
                href={developerPath}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-500 transition hover:bg-indigo-500/20"
              >
                <Code2 className="h-4 w-4" />
                Developer Panel
              </Link>
            )}

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
            >
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
        <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <ShieldCheck className="h-4 w-4" />
              {session.role ===
              "DEVELOPER"
                ? "Developer Access"
                : "Administrator Access"}
            </div>

            <h2 className="text-3xl font-bold tracking-tight">
              Store Administration
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Manage products, orders, customers,
              inventory and store operations from one
              central workspace.
            </p>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AdminCard
            icon={PackageSearch}
            title="Products"
            description="Create, edit, remove and manage store products."
          />

          <AdminCard
            icon={Boxes}
            title="Inventory"
            description="Monitor stock levels and inventory operations."
          />

          <AdminCard
            icon={ShoppingCart}
            title="Orders"
            description="Review and manage customer orders and delivery status."
          />

          <AdminCard
            icon={Users}
            title="Customers"
            description="View and manage registered customer accounts."
          />

          <AdminCard
            icon={BarChart3}
            title="Reports"
            description="Business statistics and store performance will appear here."
          />

          {session.role ===
            "DEVELOPER" && (
            <Link
              href={developerPath}
              className="group rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <Code2 className="h-6 w-6" />
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-500" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Developer Console
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Open the developer-level system controls.
              </p>
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}

function AdminCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}