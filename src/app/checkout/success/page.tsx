// FILE: src/app/checkout/success/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  PackageCheck,
} from "lucide-react";

type OrderStatus = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
};

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");

      if (!sessionId) {
        setError("Payment session information is missing.");
        setLoading(false);
        return;
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const response = await fetch(
            `/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
            { cache: "no-store" }
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Unable to verify your order.");
          }

          setOrder(data.order);
          setLoading(false);

          if (data.order.paymentStatus === "PAID") {
            return;
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : "Unable to verify your order.");
          setLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setLoading(false);
    }

    loadStatus();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-xl sm:p-12">
        {loading ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">Confirming your payment</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We are checking the payment result and finalizing your order.
            </p>
          </>
        ) : error ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <PackageCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">Payment verification needs attention</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
          </>
        ) : order?.paymentStatus === "PAID" ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">Payment successful 🎉</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your order has been confirmed and is now available in your order history.
            </p>
            <div className="mx-auto mt-7 max-w-md rounded-2xl border border-border bg-background p-5 text-left">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="break-all font-mono font-semibold">{order.id}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-semibold text-emerald-500">PAID</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <PackageCheck className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">Payment is still processing</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your order exists, but the payment confirmation has not reached MyShop yet. Check My Orders shortly.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            View My Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold hover:bg-accent"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
