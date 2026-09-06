// FILE: src/app/dashboard/orders/page.tsx

import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) return null;

  const orders = await db.order.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
          <Package className="h-3.5 w-3.5" />
          Order History
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          My Orders
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review your purchases and order status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-bold">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your completed purchases will appear here.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Order
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold">
                    {order.id}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
                  {order.status}
                </span>
              </div>

              <div className="mt-5 space-y-3 border-t border-border pt-5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {item.product.title} × {item.quantity}
                    </span>

                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-between border-t border-border pt-5">
                <span className="font-medium">
                  Total
                </span>

                <span className="text-lg font-bold">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
