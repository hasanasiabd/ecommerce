// FILE: src/app/categories/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch(
            "/api/categories",
            { cache: "no-store" }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load categories."
          );
        }

        setCategories(
          data.categories || []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load categories."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Boxes className="h-3.5 w-3.5" />
              Browse by category
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Categories
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Explore the MyShop catalog by category.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-3xl bg-muted"
                />
              )
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map(
              (category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                      <Boxes className="h-6 w-6" />
                    </div>

                    <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-indigo-500" />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    {category.name}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {category._count.products}{" "}
                    {category._count.products === 1
                      ? "product"
                      : "products"}
                  </p>
                </Link>
              )
            )}
          </div>
        )}

        {!loading &&
          categories.length === 0 && (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <h2 className="text-xl font-bold">
                No categories available
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Categories will appear here once an
                administrator creates them.
              </p>
            </div>
          )}
      </section>
    </main>
  );
}
