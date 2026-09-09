// FILE: src/app/admin/page.tsx

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Code2,
  PackageSearch,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath, getDeveloperPanelPath } from "@/lib/env";
import AdminLogin from "./admin-login";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DEVELOPER")) {
    return <AdminLogin />;
  }

  const adminPath = getAdminPanelPath();
  const developerPath = getDeveloperPanelPath();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <ShieldCheck className="h-4 w-4" />
              {session.role === "DEVELOPER" ? "Developer Access" : "Administrator Access"}
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Store Administration</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Manage products, categories, inventory, orders, customers and business intelligence from one central workspace.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-accent sm:w-auto"
          >
            Store Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AdminCard href={adminPath} icon={ShieldCheck} title="Dashboard" description="Return to the main administration workspace." />
          <AdminCard href={`${adminPath}/products`} icon={PackageSearch} title="Products" description="Create, edit, remove and manage store products." />
          <AdminCard href={`${adminPath}/categories`} icon={Boxes} title="Categories" description="Organize products into clean store categories." />
          <AdminCard href={`${adminPath}/inventory`} icon={Boxes} title="Inventory" description="Monitor stock levels and identify products that need attention." />
          <AdminCard href={`${adminPath}/orders`} icon={ShoppingCart} title="Orders" description="Review customer orders and manage fulfillment status." />
          <AdminCard href={`${adminPath}/customers`} icon={Users} title="Customers" description="Review customer accounts and recent activity." />
          <AdminCard href={`${adminPath}/reports`} icon={BarChart3} title="Reports" description="Visualize revenue, orders, customers and inventory performance." />
          <AdminCard href={`${adminPath}/analysis`} icon={BarChart3} title="Analysis" description="Compare periods and understand growth, decline and trends." />
          <AdminCard href={`${adminPath}/settings`} icon={Settings} title="Settings" description="Review store configuration and administrator preferences." />

          {session.role === "DEVELOPER" ? (
            <AdminCard
              href={developerPath}
              icon={Code2}
              title="Developer Console"
              description="Open developer-level system and administrator controls."
              accent
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function AdminCard({
  href,
  icon: Icon,
  title,
  description,
  accent = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        accent
          ? "border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Icon className="h-6 w-6" />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-500" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </Link>
  );
}
