// FILE: src/app/admin/analysis/page.tsx

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Boxes,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath } from "@/lib/env";
import { getAdminAnalysis, normalizeAnalyticsRange } from "@/lib/admin-analytics";
import { AdminKpiCard } from "@/components/admin-analytics/kpi-card";
import { ComparisonBars } from "@/components/admin-analytics/comparison-bars";

export default async function AdminAnalysisPage({
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
  const analysis = await getAdminAnalysis(range);

  const revenueChange = calculateChange(analysis.current.revenue, analysis.previous.revenue);
  const ordersChange = calculateChange(analysis.current.paidOrders, analysis.previous.paidOrders);
  const customerChange = calculateChange(analysis.current.customers, analysis.previous.customers);
  const aovChange = calculateChange(analysis.current.averageOrderValue, analysis.previous.averageOrderValue);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Activity className="h-3.5 w-3.5" />
              Business Analysis
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analysis</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Compare the current period with the immediately preceding period to understand growth, decline and business performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={adminPath}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Panel
            </Link>
            <Link
              href={`${adminPath}/reports?range=${range}`}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[7, 30, 90, 365].map((days) => (
            <Link
              key={days}
              href={`${adminPath}/analysis?range=${days}`}
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
            label="Revenue Growth"
            value={formatChange(revenueChange)}
            helper={`Current: $${analysis.current.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            trend="Current vs previous"
          />
          <AdminKpiCard
            icon={ShoppingCart}
            label="Paid Orders"
            value={formatChange(ordersChange)}
            helper={`Current: ${analysis.current.paidOrders.toLocaleString()}`}
            trend="Period comparison"
          />
          <AdminKpiCard
            icon={Users}
            label="Customer Growth"
            value={formatChange(customerChange)}
            helper={`Current: ${analysis.current.customers.toLocaleString()}`}
            trend="New customer accounts"
          />
          <AdminKpiCard
            icon={Boxes}
            label="Average Order Value"
            value={formatChange(aovChange)}
            helper={`Current: $${analysis.current.averageOrderValue.toFixed(2)}`}
            trend="Order quality"
          />
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Period Comparison</p>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">What changed?</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                The current period is compared against the immediately previous period of the same length. This makes the dashboard useful for spotting growth, slowdown and shifts in buying behavior.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ComparisonMetric label="Revenue" current={analysis.current.revenue} previous={analysis.previous.revenue} currency />
              <ComparisonMetric label="Paid Orders" current={analysis.current.paidOrders} previous={analysis.previous.paidOrders} />
              <ComparisonMetric label="Units Sold" current={analysis.current.unitsSold} previous={analysis.previous.unitsSold} />
              <ComparisonMetric label="Customers" current={analysis.current.customers} previous={analysis.previous.customers} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <ComparisonBars
            title="Top Product Comparison"
            description="Revenue contribution by product across the two periods."
            currentLabel="Current"
            previousLabel="Previous"
            data={analysis.productComparison}
          />

          <ComparisonBars
            title="Category Comparison"
            description="Which categories are gaining or losing revenue?"
            currentLabel="Current"
            previousLabel="Previous"
            data={analysis.categoryComparison}
          />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            icon={revenueChange >= 0 ? TrendingUp : TrendingDown}
            title="Revenue signal"
            text={
              revenueChange >= 0
                ? `Revenue is up ${Math.abs(revenueChange).toFixed(1)}% versus the previous period.`
                : `Revenue is down ${Math.abs(revenueChange).toFixed(1)}% versus the previous period.`
            }
            positive={revenueChange >= 0}
          />
          <InsightCard
            icon={ordersChange >= 0 ? TrendingUp : TrendingDown}
            title="Order volume"
            text={
              ordersChange >= 0
                ? `Paid order volume increased by ${Math.abs(ordersChange).toFixed(1)}%.`
                : `Paid order volume decreased by ${Math.abs(ordersChange).toFixed(1)}%.`
            }
            positive={ordersChange >= 0}
          />
          <InsightCard
            icon={aovChange >= 0 ? TrendingUp : TrendingDown}
            title="Basket quality"
            text={
              aovChange >= 0
                ? `Average order value improved by ${Math.abs(aovChange).toFixed(1)}%.`
                : `Average order value declined by ${Math.abs(aovChange).toFixed(1)}%.`
            }
            positive={aovChange >= 0}
          />
          <InsightCard
            icon={Users}
            title="Customer acquisition"
            text={`The selected period added ${analysis.current.customers.toLocaleString()} new customer account${analysis.current.customers === 1 ? "" : "s"}.`}
            positive={analysis.current.customers >= analysis.previous.customers}
          />
        </section>
      </div>
    </div>
  );
}

function ComparisonMetric({
  label,
  current,
  previous,
  currency = false,
}: {
  label: string;
  current: number;
  previous: number;
  currency?: boolean;
}) {
  const change = calculateChange(current, previous);

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-xl font-bold">{currency ? `$${current.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : current.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">Previous: {currency ? `$${previous.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : previous.toLocaleString()}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${change >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
          {formatChange(change)}
        </span>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  text,
  positive,
}: {
  icon: typeof TrendingUp;
  title: string;
  text: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-sm font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function formatChange(value: number) {
  const rounded = Math.abs(value).toFixed(1);
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${rounded}%`;
}
