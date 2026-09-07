// FILE: src/app/cart/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import {
  getFirstProductImage,
} from "@/lib/product-images";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    stock: number;
    images: string;
  };
};

// function getImage(value: string) {
//   try {
//     const parsed = JSON.parse(value);

//     if (
//       Array.isArray(parsed) &&
//       typeof parsed[0] === "string"
//     ) {
//       return parsed[0];
//     }
//   } catch {}

//   return value || "/logo.svg";
// }

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/cart",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login?next=/cart";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load cart."
        );
      }

      setItems(data.items || []);
      setSubtotal(
        Number(data.summary?.subtotal || 0)
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load cart."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQuantity(
    productId: string,
    quantity: number
  ) {
    if (quantity < 1) return;

    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update quantity."
        );
      }

      await loadCart();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update quantity."
      );
    }
  }

  async function removeItem(
    productId: string
  ) {
    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to remove item."
        );
      }

      await loadCart();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove item."
      );
    }
  }

  async function clearCart() {
    if (
      !window.confirm(
        "Clear all items from your cart?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to clear cart."
        );
      }

      await loadCart();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to clear cart."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="mt-8 h-40 rounded-3xl bg-muted" />
          <div className="mt-4 h-40 rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
            <ShoppingBag className="h-3.5 w-3.5" />
            Shopping Cart
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Your Cart
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Review your items before checkout.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />

            <h2 className="mt-5 text-xl font-bold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Find something you like and add it to your cart.
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
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {items.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0
                  )}{" "}
                  item(s)
                </p>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm font-medium text-red-500 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={getFirstProductImage(
                        item.product.images
                      )}
                      alt={item.product.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />

                    {/* <Image
                      src={getImage(
                        item.product.images
                      )}
                      alt={item.product.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    /> */}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">
                      {item.product.title}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          item.quantity <= 1
                        }
                        className="rounded-xl border border-border p-2 hover:bg-accent disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          item.quantity >=
                          item.product.stock
                        }
                        className="rounded-xl border border-border p-2 hover:bg-accent disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                    <p className="text-lg font-bold">
                      $
                      {(
                        item.product.price *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item.product.id
                        )
                      }
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:underline"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3 border-b border-border pb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Shipping
                  </span>

                  <span className="font-medium">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Continue to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
