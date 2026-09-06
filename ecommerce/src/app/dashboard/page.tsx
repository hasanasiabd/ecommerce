// FILE: src/app/dashboard/page.tsx

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardOverview() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    wishlistCount,
  ] = await Promise.all([
    db.order.count({
      where: {
        userId: session.userId,
      },
    }),

    db.order.count({
      where: {
        userId: session.userId,
        status: {
          in: [
            "PENDING",
            "PROCESSING",
            "SHIPPED",
          ],
        },
      },
    }),

    db.order.count({
      where: {
        userId: session.userId,
        status: "DELIVERED",
      },
    }),

    db.wishlistItem.count({
      where: {
        userId: session.userId,
      },
    }),
  ]);

  const displayName =
    session.email
      .split("@")[0]
      .replace(
        /^./,
        (character) =>
          character.toUpperCase()
      );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <UserRound className="h-3.5 w-3.5" />
              Customer Account
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {displayName}! 👋
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your orders, account details and
              shopping activity from your personal
              dashboard.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          icon={Package}
          label="Total Orders"
          value={totalOrders}
          description="All orders placed"
        />

        <DashboardStat
          icon={Clock3}
          label="Active Orders"
          value={pendingOrders}
          description="Not delivered yet"
        />

        <DashboardStat
          icon={CheckCircle2}
          label="Delivered"
          value={deliveredOrders}
          description="Successfully completed"
        />

        <DashboardStat
          icon={Heart}
          label="Wishlist"
          value={wishlistCount}
          description="Saved products"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Your Account
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Current account information
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <UserRound className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 divide-y divide-border rounded-2xl border border-border">
            <AccountRow
              label="Email"
              value={session.email}
            />

            <AccountRow
              label="Role"
              value={session.role}
            />

            <AccountRow
              label="User ID"
              value={session.userId}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-5 space-y-3">
            <QuickAction
              href="/dashboard/orders"
              icon={Package}
              title="My Orders"
              description="View your order history"
            />

            <QuickAction
              href="/dashboard/wishlist"
              icon={Heart}
              title="Wishlist"
              description="Saved products"
            />

            <QuickAction
              href="/dashboard/settings"
              icon={UserRound}
              title="Settings"
              description="Manage your account"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardStat({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function AccountRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="break-all text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition hover:bg-accent"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  );
}