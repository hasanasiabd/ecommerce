// FILE: src/components/navbar.tsx

import Link from "next/link";
import Image from "next/image";
import {
  Code2,
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import {
  getAdminPanelPath,
  getDeveloperPanelPath,
} from "@/lib/env";
import { db } from "@/lib/db";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNavbarMenu } from "@/components/mobile-navbar-menu";

export async function Navbar() {
  const session =
    await getSession();

  let cartCount = 0;

  if (session) {
    cartCount =
      await db.cartItem
        .aggregate({
          where: {
            userId:
              session.userId,
          },
          _sum: {
            quantity: true,
          },
        })
        .then(
          (result) =>
            result._sum.quantity ??
            0
        );
  }

  const adminPath =
    session &&
    (session.role === "ADMIN" ||
      session.role === "DEVELOPER")
      ? getAdminPanelPath()
      : null;

  const developerPath =
    session?.role ===
    "DEVELOPER"
      ? getDeveloperPanelPath()
      : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

        {/* Brand */}
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3"
        >
          <Image
            src="/logo.svg"
            alt="MyShop"
            width={36}
            height={36}
            priority
            className="rounded-lg"
          />

          <span className="hidden text-xl font-bold tracking-tight xs:inline sm:inline">
            My
            <span className="text-indigo-500">
              Shop
            </span>
          </span>

          <span className="text-lg font-bold tracking-tight sm:hidden">
            My
            <span className="text-indigo-500">
              Shop
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Products
          </Link>

          <Link
            href="/categories"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Categories
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex min-w-0 items-center gap-2">

          {/* Mobile Menu */}
          <MobileNavbarMenu
            isAuthenticated={
              Boolean(session)
            }
            adminPath={adminPath}
            developerPath={
              developerPath
            }
          />

          <ThemeToggle />

          <Link
            href="/cart"
            aria-label={`Cart${
              cartCount > 0
                ? `, ${cartCount} items`
                : ""
            }`}
            className="
              relative inline-flex
              h-10 shrink-0
              items-center gap-2
              rounded-xl
              border border-border
              bg-card
              px-3
              text-sm font-medium
              transition
              hover:bg-accent
              sm:h-auto
              sm:py-2
            "
          >
            <ShoppingCart className="h-4 w-4" />

            <span className="hidden sm:inline">
              Cart
            </span>

            {cartCount >
              0 && (
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="
                  inline-flex
                  h-10 shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-3.5
                  text-sm font-semibold
                  text-white
                  transition
                  hover:bg-indigo-500
                  sm:h-auto
                  sm:py-2
                "
              >
                <LayoutDashboard className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Dashboard
                </span>
              </Link>

              {adminPath && (
                <Link
                  href={adminPath}
                  className="
                    hidden
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-indigo-500/20
                    bg-indigo-500/10
                    px-3.5 py-2
                    text-sm font-semibold
                    text-indigo-500
                    transition
                    hover:bg-indigo-500/20
                    sm:inline-flex
                  "
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}

              {developerPath && (
                <Link
                  href={developerPath}
                  className="
                    hidden
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-violet-500/20
                    bg-violet-500/10
                    px-3.5 py-2
                    text-sm font-semibold
                    text-violet-500
                    transition
                    hover:bg-violet-500/20
                    lg:inline-flex
                  "
                >
                  <Code2 className="h-4 w-4" />
                  Developer
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="
                inline-flex
                h-10 shrink-0
                items-center
                rounded-xl
                bg-indigo-600
                px-4
                text-sm font-semibold
                text-white
                transition
                hover:bg-indigo-500
                sm:h-auto
                sm:py-2
              "
            >
              <span className="hidden sm:inline">
                Sign In
              </span>

              <span className="sm:hidden">
                Sign In
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
