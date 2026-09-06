// FILE: src/app/checkout/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
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
  const [items, setItems] =
    useState<CartItem[]>([]);
  const [subtotal, setSubtotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [address, setAddress] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch(
            "/api/cart",
            { cache: "no-store" }
          );

        const data =
          await response.json();

        if (response.status === 401) {
          window.location.href =
            "/login?next=/checkout";
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load checkout."
          );
        }

        setItems(
          data.items || []
        );

        setSubtotal(
          Number(
            data.summary?.subtotal ||
              0
          )
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-9 w-48 rounded bg-muted" />
          <div className="mt-8 h-80 rounded-3xl bg-muted" />
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
            Checkout
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Complete Your Order
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review your order and provide your delivery details.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add at least one product before checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Payment integration will be connected after this step.
                  </p>
                </div>
              </div>

              <textarea
                rows={6}
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
                placeholder="Full delivery address..."
                className="mt-6 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
                Payment gateway connection is the next checkout step.
              </div>

              <button
                type="button"
                disabled={!address.trim()}
                className="mt-5 w-full rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </section>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 border-b border-border pb-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 truncate text-muted-foreground">
                      {item.product.title} × {item.quantity}
                    </span>

                    <span className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
