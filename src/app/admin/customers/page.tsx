// FILE: src/app/admin/customers/page.tsx

import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  Users,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAdminPanelPath } from "@/lib/env";

export default async function AdminCustomersPage() {
  const session = await getSession();

  if (
    !session ||
    (session.role !== "ADMIN" && session.role !== "DEVELOPER")
  ) {
    return null;
  }

  const adminPath = getAdminPanelPath();

  const [
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    recentCustomers,
  ] = await Promise.all([
    db.user.count({
      where: {
        role: "USER",
      },
    }),

    db.user.count({
      where: {
        role: "USER",
        isActive: true,
      },
    }),

    db.user.count({
      where: {
        role: "USER",
        isActive: false,
      },
    }),

    db.user.findMany({
      where: {
        role: "USER",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Users className="h-3.5 w-3.5" />
              Customer Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Customers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review registered customers, account activity and their order
              history at a glance.
            </p>
          </div>

          <Link
            href={adminPath}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-accent sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <CustomerStat
            icon={Users}
            label="Total Customers"
            value={totalCustomers}
            description="Registered user accounts"
          />

          <CustomerStat
            icon={UserCheck}
            label="Active"
            value={activeCustomers}
            description="Accounts currently enabled"
          />

          <CustomerStat
            icon={UserX}
            label="Inactive"
            value={inactiveCustomers}
            description="Accounts currently disabled"
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Recent Customers
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                The latest customer accounts created in your store.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Customer accounts only
            </div>
          </div>

          {recentCustomers.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 font-semibold">
                No customers yet
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Customer accounts will appear here after registration.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentCustomers.map((customer) => {
                const displayName =
                  customer.name?.trim() ||
                  customer.username?.trim() ||
                  customer.email.split("@")[0];

                return (
                  <div
                    key={customer.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {displayName}
                        </p>

                        <p className="truncate text-sm text-muted-foreground">
                          {customer.email}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Joined{" "}
                          {customer.createdAt.toLocaleDateString()} ·{" "}
                          {customer._count.orders} orders
                        </p>
                      </div>
                    </div>

                    <span
                      className={
                        customer.isActive
                          ? "inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600"
                          : "inline-flex w-fit items-center rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500"
                      }
                    >
                      {customer.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CustomerStat({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-sm font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}