// FILE: src/app/products/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Package,
} from "lucide-react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

function getFirstImage(
  images: string
) {
  try {
    const parsed =
      JSON.parse(images);

    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === "string" &&
      parsed[0].trim()
    ) {
      return parsed[0];
    }
  } catch {
    // Ignore invalid JSON
  }

  if (
    images &&
    images !== "[]" &&
    images.trim() !== ""
  ) {
    return images;
  }

  return "/logo.svg";
}

export default function ProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [sort, setSort] =
    useState("newest");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (category) {
        params.set(
          "category",
          category
        );
      }

      params.set("sort", sort);
      params.set("limit", "24");

      const [
        productResponse,
        categoryResponse,
      ] = await Promise.all([
        fetch(
          `/api/products?${params.toString()}`,
          {
            cache: "no-store",
          }
        ),
        fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        ),
      ]);

      const productData =
        await productResponse.json();

      const categoryData =
        await categoryResponse.json();

      if (!productResponse.ok) {
        throw new Error(
          productData.error ||
            "Unable to load products."
        );
      }

      if (!categoryResponse.ok) {
        throw new Error(
          categoryData.error ||
            "Unable to load categories."
        );
      }

      setProducts(
        productData.products || []
      );

      setCategories(
        categoryData.categories || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load store data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer =
      setTimeout(
        loadData,
        250
      );

    return () =>
      clearTimeout(timer);
  }, [
    search,
    category,
    sort,
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Package className="h-3.5 w-3.5" />
              MyShop Catalog
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Explore Products
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Discover products, search the catalog and
              filter by category or price.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products..."
              className="w-full rounded-2xl border border-border bg-card px-11 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="min-w-52 appearance-none rounded-2xl border border-border bg-card py-3.5 pl-11 pr-10 text-sm outline-none transition focus:border-indigo-500"
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.slug}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>
          </div>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
            }
            className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500"
          >
            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-border bg-card"
                >
                  <div className="h-60 animate-pulse bg-muted" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card px-6 py-20 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-bold">
              No products found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Try another search term or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(
              (product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-60 overflow-hidden bg-muted">
                    <Image
                      src={getFirstImage(
                        product.images
                      )}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      {product.category.name}
                    </p>

                    <h2 className="mt-2 truncate text-lg font-semibold">
                      {product.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>

                      <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-500">
                        View
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}