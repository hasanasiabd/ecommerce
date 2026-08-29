// src/components/navbar.tsx

import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="My Shop Logo" width={36} height={36} className="rounded-lg" />
          <span className="text-xl font-bold tracking-tight text-white">
            My<span className="text-indigo-500">Shop</span>
          </span>
        </Link>

        {/* নেভবার মেনু */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/products" className="hover:text-white transition">Products</Link>
          <Link href="/categories" className="hover:text-white transition">Categories</Link>
          <Link href="/deals" className="hover:text-white transition">Deals</Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Link href="/cart" className="relative rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 transition">
            Cart (0)
          </Link>
          
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs font-medium text-gray-400">
                {session.email}
              </span>
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                Dashboard
              </Link>

              {(session.role === "ADMIN" || session.role === "DEVELOPER") && (
                <Link
                  href="/admin"
                  className="rounded-md border border-indigo-600 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-950/50"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}