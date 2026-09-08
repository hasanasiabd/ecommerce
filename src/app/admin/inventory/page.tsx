// FILE: src/app/admin/inventory/page.tsx

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  PackageSearch,
  ShoppingBag,
  Warehouse,
  XCircle,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAdminPanelPath } from "@/lib/env";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminInventoryPage() {
  const session = await getSession();

  if (
    !session ||
    (session.role !== "ADMIN" && session.role !== "DEVELOPER")
  ) {
    return null;
  }

  const adminPath = getAdminPanelPath();

  const [
    totalProducts,
    outOfStockProducts,
    lowStockProducts,
    stockAggregate,
    categories,
  ] = await Promise.all([
    db.product.count(),

    db.product.count({
      where: {
        stock: 0,
      },
    }),

    db.product.count({
      where: {
        stock: {
          gt: 0,
          lte: LOW_STOCK_THRESHOLD,
        },
      },
    }),

    db.product.aggregate({
      _sum: {
        stock: true,
      },
    }),

    db.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
  ]);

  const lowStockItems = await db.product.findMany({
    where: {
      stock: {
        lte: LOW_STOCK_THRESHOLD,
      },
    },
    orderBy: [
      {
        stock: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
    take: 12,
    select: {
      id: true,
      title: true,
      stock: true,
      price: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const totalUnits = stockAggregate._sum.stock ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Warehouse className="h-3.5 w-3.5" />
              Inventory Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Inventory
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Monitor product stock levels, identify low-stock items and keep
              an eye on your catalog inventory.
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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InventoryStat
            icon={PackageSearch}
            label="Products"
            value={totalProducts}
            description="Products in catalog"
          />

          <InventoryStat
            icon={ShoppingBag}
            label="Total Units"
            value={totalUnits}
            description="Available stock units"
          />

          <InventoryStat
            icon={AlertTriangle}
            label="Low Stock"
            value={lowStockProducts}
            description={`1–${LOW_STOCK_THRESHOLD} units remaining`}
          />

          <InventoryStat
            icon={XCircle}
            label="Out of Stock"
            value={outOfStockProducts}
            description="Products needing restock"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Stock Alerts
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Products with five or fewer units remaining.
                </p>
              </div>

              <Link
                href={`${adminPath}/products`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto"
              >
                <PackageSearch className="h-4 w-4" />
                Manage Products
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />

                <h3 className="mt-4 font-semibold">
                  Inventory looks healthy
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  No products currently need a low-stock warning.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lowStockItems.map((product) => {
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {product.title}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.category.name} · $
                          {product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span
                          className={
                            isOutOfStock
                              ? "inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500"
                              : "inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600"
                          }
                        >
                          {isOutOfStock ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          )}

                          {isOutOfStock
                            ? "Out of stock"
                            : `${product.stock} left`}
                        </span>

                        <Link
                          href={`${adminPath}/products`}
                          className="text-sm font-semibold text-indigo-500 hover:text-indigo-400"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Category Coverage
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Product distribution across categories.
                </p>
              </div>

              <Boxes className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-5 space-y-3">
              {categories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  No categories have been created yet.
                </div>
              ) : (
                categories
                  .slice(0, 8)
                  .map((category) => (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="truncate text-sm font-semibold">
                          {category.name}
                        </p>

                        <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold">
                          {category._count.products}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <Link
              href={`${adminPath}/categories`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-accent"
            >
              Manage Categories
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function InventoryStat({
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Icon className="h-5 w-5" />
        </div>
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