// FILE: src/app/admin/orders/page.tsx

"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
    };
  }>;
};

const STATUS_FILTERS = [
  "ALL",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = status === "ALL" || order.status === status;
      const haystack = [
        order.id,
        order.user.email,
        order.user.name || "",
        order.user.username || "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [orders, search, status]);

  async function updateStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update order.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: data.order.status }
            : order
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="space-y-6 p-5 sm:p-8 lg:p-10">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <ShoppingCart className="h-3.5 w-3.5" />
              Store Operations
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Monitor customer purchases, payment state and fulfillment progress from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold hover:bg-accent disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={ShoppingCart} label="Total Orders" value={orders.length} />
        <Metric icon={CreditCardIcon} label="Paid" value={orders.filter((item) => item.paymentStatus === "PAID").length} />
        <Metric icon={Truck} label="Shipping" value={orders.filter((item) => ["PROCESSING", "SHIPPED"].includes(item.status)).length} />
        <Metric icon={CheckCircle2} label="Delivered" value={orders.filter((item) => item.status === "DELIVERED").length} />
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order ID, name or email..."
              className="w-full rounded-2xl border border-border bg-background px-11 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500"
          >
            {STATUS_FILTERS.map((item) => (
              <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">No matching orders</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Orders matching your current search and filter will appear here.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updating={updatingId === order.id}
              onUpdate={updateStatus}
            />
          ))
        )}
      </section>
    </div>
  );
}

function OrderCard({
  order,
  updating,
  onUpdate,
}: {
  order: Order;
  updating: boolean;
  onUpdate: (orderId: string, nextStatus: string) => void;
}) {
  const next = getNextStatus(order.status);
  const customerName = order.user.name || order.user.username || order.user.email;

  return (
    <article className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:shadow-lg sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
              {order.status.replaceAll("_", " ")}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(order.paymentStatus)}`}>
              Payment: {order.paymentStatus.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-3 break-all font-mono text-sm font-semibold">{order.id}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-left xl:text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-bold">${Number(order.totalAmount).toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 border-t border-border pt-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
          <p className="mt-2 text-sm font-semibold">{customerName}</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{order.user.email}</p>
          {order.shippingAddress && (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Address</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{order.shippingAddress}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                <span className="min-w-0 truncate">{item.product.title} × {item.quantity}</span>
                <span className="shrink-0 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {order.status === "PAYMENT_PENDING" && next === "CANCELLED" ? (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            disabled={updating}
            onClick={() => onUpdate(order.id, "CANCELLED")}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/20 disabled:opacity-50"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel Unpaid Order
          </button>
        </div>
      ) : next ? (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          <span className="text-xs text-muted-foreground">Next: {next}</span>
          <button
            type="button"
            disabled={updating}
            onClick={() => onUpdate(order.id, next)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            Mark {next.replaceAll("_", " ")}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function getNextStatus(status: string) {
  if (status === "PAID") return "PROCESSING";
  if (status === "PROCESSING") return "SHIPPED";
  if (status === "SHIPPED") return "DELIVERED";
  if (status === "PAYMENT_PENDING") return "CANCELLED";
  return "";
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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function CreditCardIcon(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h2" /></svg>;
}
