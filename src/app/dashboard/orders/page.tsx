// FILE: src/app/dashboard/orders/page.tsx

import { MapPin, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) return null;

  const orders = await db.order.findMany({
    where: { userId: session.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
          <Package className="h-3.5 w-3.5" />
          Order History
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track payment and fulfillment status for your purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your purchases will appear here after checkout.
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
            <article key={order.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                      {order.status.replaceAll("_", " ")}
                    </span>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(order.paymentStatus)}`}>
                      Payment {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-3 break-all font-mono text-sm font-semibold">{order.id}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-muted-foreground">Order Total</p>
                  <p className="mt-1 text-2xl font-bold">${Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="mt-5 flex gap-3 rounded-2xl border border-border bg-background p-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Address</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{order.shippingAddress}</p>
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-3 border-t border-border pt-5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                    <span className="min-w-0 truncate">{item.product.title} × {item.quantity}</span>
                    <span className="shrink-0 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-500/10 text-emerald-500";
  if (status === "CANCELLED") return "bg-red-500/10 text-red-500";
  if (status === "SHIPPED") return "bg-violet-500/10 text-violet-500";
  if (status === "PROCESSING" || status === "PAID") return "bg-indigo-500/10 text-indigo-500";
  return "bg-amber-500/10 text-amber-500";
}

function paymentClass(status: string) {
  return status === "PAID"
    ? "bg-emerald-500/10 text-emerald-500"
    : "bg-amber-500/10 text-amber-500";
}
