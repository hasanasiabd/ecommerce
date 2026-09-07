// FILE: src/app/checkout/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
  };
};

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [address, setAddress] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      const response = await fetch("/api/cart", { cache: "no-store" });
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login?next=/checkout";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load checkout.");
      }

      setItems(data.items || []);
      setSubtotal(Number(data.summary?.subtotal || 0));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load checkout.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const canceled = params.get("canceled") === "1";
    const orderId = params.get("order_id") || "";

    if (canceled) {
      setNotice("Your payment was canceled. Releasing the reserved stock...");

      if (orderId) {
        void (async () => {
          try {
            const response = await fetch("/api/checkout/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Unable to release the canceled checkout.");
            }

            setNotice("Payment canceled. Your reserved stock has been released.");
            await loadCart();
          } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to release the canceled checkout.");
          }
        })();
      }
    }

    loadCart();
  }, []);

  async function startPayment() {
    if (!address.trim() || processing) return;

    setError("");
    setProcessing(true);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start payment.");
      }

      if (!data.checkoutUrl) {
        throw new Error("Payment gateway did not return a checkout URL.");
      }

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to start payment.");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-12 text-foreground">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-9 w-48 rounded bg-accent" />
          <div className="mt-8 h-96 rounded-3xl bg-accent" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
            <CreditCard className="h-3.5 w-3.5" />
            Secure Checkout
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">Complete Your Order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Confirm your delivery address, then continue to Stripe's secure payment page.
          </p>
        </div>

        {notice && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-600 dark:text-emerald-400 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {notice}
            </span>

          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add at least one product before checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Delivery Address</h2>
                  <p className="text-sm text-muted-foreground">
                    This address will be attached to your order.
                  </p>
                </div>
              </div>

              <textarea
                rows={7}
                maxLength={500}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="House / Road, Area, City, District, Postal Code..."
                className="mt-6 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Minimum 10 characters</span>
                <span>{address.length}/500</span>
              </div>

              <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-600 dark:text-indigo-300">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Secure payment</p>
                    <p className="mt-1 text-xs leading-5 opacity-90">
                      Card details are entered on Stripe's hosted checkout page, not stored by MyShop.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={startPayment}
                disabled={address.trim().length < 10 || processing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing Payment...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </section>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="mt-5 space-y-4 border-b border-border pb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.product.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Final stock and prices are revalidated by the server when payment starts.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
