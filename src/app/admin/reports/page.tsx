// FILE: src/app/admin/reports/page.tsx

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Boxes,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath } from "@/lib/env";
import { getAdminReports, normalizeAnalyticsRange } from "@/lib/admin-analytics";
import { AdminKpiCard } from "@/components/admin-analytics/kpi-card";
import { TrendChart } from "@/components/admin-analytics/trend-chart";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DEVELOPER")) {
    return null;
  }

  const params = await searchParams;
  const range = normalizeAnalyticsRange(params.range);
  const adminPath = getAdminPanelPath();
  const reports = await getAdminReports(range);

  const statuses = Object.entries(reports.statusCounts).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...statuses.map(([, value]) => value), 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <BarChart3 className="h-3.5 w-3.5" />
              Store Reports
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Visualize sales, orders, customer activity and inventory health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={adminPath}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Panel
            </Link>
            <Link
              href={`${adminPath}/analysis`}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Activity className="h-4 w-4" />
              Analysis
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[7, 30, 90, 365].map((days) => (
            <Link
              key={days}
              href={`${adminPath}/reports?range=${days}`}
              className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                days === range
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-500"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {days === 7 ? "7D" : days === 30 ? "30D" : days === 90 ? "90D" : "1Y"}
            </Link>
          ))}
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            icon={TrendingUp}
            label="Revenue"
            value={`$${reports.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            helper={`Paid revenue · ${range} day period`}
          />
          <AdminKpiCard
            icon={ShoppingCart}
            label="Paid Orders"
            value={reports.paidOrders.toLocaleString()}
            helper={`${reports.totalOrders.toLocaleString()} total orders created`}
          />
          <AdminKpiCard
            icon={Users}
            label="New Customers"
            value={reports.newCustomers.toLocaleString()}
            helper={`New customer accounts · ${range} days`}
          />
          <AdminKpiCard
            icon={Boxes}
            label="Inventory Units"
            value={reports.totalStock.toLocaleString()}
            helper={`${reports.lowStockProducts} low stock · ${reports.outOfStockProducts} out of stock`}
          />
        </section>

        <section className="mt-6">
          <TrendChart data={reports.trend} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">Top Products</h2>
                <p className="mt-1 text-sm text-muted-foreground">Products contributing the most paid revenue.</p>
              </div>
              <PackageSearch className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-5 space-y-3">
              {reports.topProducts.length === 0 ? (
                <EmptyReport text="No paid product sales in this period." />
              ) : (
                reports.topProducts.map((product, index) => {
                  const max = reports.topProducts[0]?.revenue || 1;
                  return (
                    <div key={product.name} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-xs font-bold text-indigo-500">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{product.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{product.units.toLocaleString()} units sold</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold">${product.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(product.revenue / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">Order Status</h2>
                <p className="mt-1 text-sm text-muted-foreground">Operational distribution for the selected period.</p>
              </div>
              <ShoppingCart className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-5 space-y-4">
              {statuses.length === 0 ? (
                <EmptyReport text="No orders in this period." />
              ) : (
                statuses.map(([status, value]) => (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{status.replaceAll("_", " ")}</span>
                      <span className="text-sm font-bold">{value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-accent">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(value / maxStatus) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Average Order Value" value={`$${reports.averageOrderValue.toFixed(2)}`} />
          <SummaryCard label="Units Sold" value={reports.unitsSold.toLocaleString()} />
          <SummaryCard label="Catalog Products" value={reports.totalProducts.toLocaleString()} />
          <SummaryCard label="Low Stock" value={reports.lowStockProducts.toLocaleString()} />
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function EmptyReport({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</div>;
}
