// FILE: src/app/page.tsx

import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/db";
import { getFirstProductImage } from "@/lib/product-images";
import type { Prisma } from "@prisma/client";

type HomeProduct = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

export default async function Home() {
  let products: HomeProduct[] = [];

  try {
    products = await db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error(
      "Home product loading error:",
      error
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* =====================================================
          HERO SECTION
         ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              New Collection 2026
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Discover Quality Products for Your{" "}
              <span className="text-indigo-500">
                Lifestyle
              </span>
            </h1>

            <p className="text-lg text-muted-foreground">
              Explore our curated selection of premium
              products designed to elevate your daily routine.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                Shop Now
              </Link>

              <Link
                href="/categories"
                className="rounded-lg border border-border bg-card px-6 py-3 font-semibold transition hover:bg-accent"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          <div className="relative h-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:h-96">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
              alt="MyShop products"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-85"
              priority
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCTS SECTION
         ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Featured Products
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Latest products from our store
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold">
              No products available
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Products will appear here once they are added
              to the store.
            </p>

            <Link
              href="/products"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-indigo-500
              "
            >
              Browse Products
              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-border
                    bg-card
                    shadow-lg
                    transition
                    hover:border-indigo-500/50
                  "
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="block"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <Image
                        src={getFirstProductImage(
                          product.images
                        )}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-300 hover:scale-105"
                      />
                    </div>

                    <div className="space-y-3 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                          {product.category.name}
                        </p>

                        <h3 className="mt-1 truncate font-semibold">
                          {product.title}
                        </h3>
                      </div>

                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold text-indigo-500">
                          ${product.price.toFixed(2)}
                        </span>

                        <span
                          className={`text-xs font-medium ${
                            product.stock > 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-4 pb-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        rounded-lg
                        bg-indigo-600
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-indigo-500
                      "
                    >
                      View Product
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* =================================================
                VIEW ALL PRODUCTS
               ================================================= */}

            <div className="mt-10 flex justify-center">
              <Link
                href="/products"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-indigo-500/10
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-indigo-500
                  transition
                  hover:bg-indigo-500/20
                "
              >
                <span className="sm:hidden">
                  View All
                </span>

                <span className="hidden sm:inline">
                  View All Products
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          FOOTER
         ===================================================== */}

      <footer className="mt-20 border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} MyShop. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}