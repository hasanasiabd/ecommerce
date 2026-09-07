"use client";

import Link from "next/link";
import {
  Code2,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";

type MobileNavMenuProps = {
  session: {
    role: string;
  } | null;
  cartCount: number;
  adminPath: string | null;
  developerPath: string | null;
};

export function MobileNavMenu({
  session,
  cartCount,
  adminPath,
  developerPath,
}: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col border-l border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  MyShop
                </p>
                <h2 className="text-lg font-bold">
                  Navigation
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  Home
                </Link>

                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-foreground"
                >
                  Products
                </Link>

                <Link
                  href="/categories"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  Categories
                </Link>

                <Link
                  href="/cart"
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </span>

                  {cartCount > 0 && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {session && (
                <div className="mt-6 border-t border-border pt-6">
                  <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Account
                  </p>

                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {adminPath && (
                      <Link
                        href={adminPath}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-indigo-500 transition hover:bg-indigo-500/10"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </Link>
                    )}

                    {developerPath && (
                      <Link
                        href={developerPath}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-violet-500 transition hover:bg-violet-500/10"
                      >
                        <Code2 className="h-4 w-4" />
                        Developer
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </nav>

            {!session && (
              <div className="border-t border-border p-4">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Sign In
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}