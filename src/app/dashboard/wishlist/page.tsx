// FILE: src/app/dashboard/wishlist/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Heart,
  Trash2,
} from "lucide-react";
import {
  getFirstProductImage,
} from "@/lib/product-images";

type WishlistItem = {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    stock: number;
    images: string;
    category: {
      name: string;
    };
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

export default function WishlistPage() {
  const [items, setItems] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadWishlist() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/wishlist",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load wishlist."
        );
      }

      setItems(data.items || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load wishlist."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function remove(productId: string) {
    try {
      const response =
        await fetch(
          "/api/wishlist",
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

      await loadWishlist();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove item."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
          <Heart className="h-3.5 w-3.5" />
          Saved Products
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Wishlist
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep products you want to revisit later.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-3xl bg-muted"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-xl font-bold">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Save products from their detail page to see them here.
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
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm"
            >
              <Link
                href={`/products/${item.product.id}`}
                className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted"
              >
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
                  src={getImage(item.product.images)}
                  alt={item.product.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                /> */}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  {item.product.category.name}
                </p>

                <Link
                  href={`/products/${item.product.id}`}
                  className="mt-1 block truncate font-semibold hover:text-indigo-500"
                >
                  {item.product.title}
                </Link>

                <p className="mt-2 text-lg font-bold">
                  ${item.product.price.toFixed(2)}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {item.product.stock > 0
                      ? `${item.product.stock} available`
                      : "Out of stock"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      remove(
                        item.product.id
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
