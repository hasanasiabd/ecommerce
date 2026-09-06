// FILE: src/app/products/[id]/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  Package,
  ShoppingCart,
} from "lucide-react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  category: {
    name: string;
    slug: string;
  };
};

function parseImages(
  value: string
) {
  try {
    const parsed =
      JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string"
      );
    }
  } catch {
    // ignore
  }

  return value
    ? [value]
    : ["/logo.svg"];
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const { id } =
          await params;

        const response =
          await fetch(
            `/api/products/${id}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Product not found."
          );
        }

        setProduct(
          data.product
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="h-[500px] rounded-3xl bg-muted" />
            <div className="space-y-5">
              <div className="h-6 w-1/4 rounded bg-muted" />
              <div className="h-12 w-3/4 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />

          <h1 className="mt-4 text-2xl font-bold">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error ||
              "The requested product could not be found."}
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const images =
    parseImages(
      product.images
    );

  const currentImage =
    images[
      selectedImage
    ] || images[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src={currentImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map(
                  (image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          index
                        )
                      }
                      className={`relative aspect-square overflow-hidden rounded-xl border ${
                        selectedImage ===
                        index
                          ? "border-indigo-500 ring-2 ring-indigo-500/20"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
              {product.category.name}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {product.title}
            </h1>

            <p className="mt-5 text-3xl font-bold">
              ${product.price.toFixed(2)}
            </p>

            <p className="mt-6 text-base leading-8 text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />

              {product.stock > 0
                ? `${product.stock} items available`
                : "Currently out of stock"}
            </div>

            {actionMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                {actionMessage}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={
                  product.stock <= 0 ||
                  cartLoading
                }
                onClick={async () => {
                  setCartLoading(true);
                  setActionMessage("");

                  try {
                    const response =
                      await fetch(
                        "/api/cart",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type":
                              "application/json",
                          },
                          body: JSON.stringify({
                            productId:
                              product.id,
                            quantity: 1,
                          }),
                        }
                      );

                    const data =
                      await response.json();

                    if (response.status === 401) {
                      window.location.href =
                        "/login";
                      return;
                    }

                    if (!response.ok) {
                      throw new Error(
                        data.error ||
                          "Unable to add to cart."
                      );
                    }

                    setActionMessage(
                      "Product added to your cart."
                    );
                  } catch (error) {
                    setActionMessage(
                      error instanceof Error
                        ? error.message
                        : "Unable to add to cart."
                    );
                  } finally {
                    setCartLoading(false);
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartLoading
                  ? "Adding..."
                  : "Add to Cart"}
              </button>

              <button
                type="button"
                disabled={product.stock <= 0}
                className="flex-1 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>

              <button
                type="button"
                disabled={wishlistLoading}
                onClick={async () => {
                  setWishlistLoading(true);
                  setActionMessage("");

                  try {
                    const response =
                      await fetch(
                        "/api/wishlist",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type":
                              "application/json",
                          },
                          body: JSON.stringify({
                            productId:
                              product.id,
                          }),
                        }
                      );

                    const data =
                      await response.json();

                    if (response.status === 401) {
                      window.location.href =
                        "/login";
                      return;
                    }

                    if (!response.ok) {
                      throw new Error(
                        data.error ||
                          "Unable to update wishlist."
                      );
                    }

                    setActionMessage(
                      "Product saved to your wishlist."
                    );
                  } catch (error) {
                    setActionMessage(
                      error instanceof Error
                        ? error.message
                        : "Unable to update wishlist."
                    );
                  } finally {
                    setWishlistLoading(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold transition hover:bg-accent disabled:opacity-50"
                aria-label="Add to wishlist"
                title="Add to wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">
                Secure Shopping
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your order and payment data will be handled
                through the secure checkout system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}