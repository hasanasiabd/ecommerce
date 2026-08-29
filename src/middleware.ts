// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("myshop_session")?.value;

  const secretDev = process.env.NEXT_PUBLIC_DEV_ROUTE
    ? `/${process.env.NEXT_PUBLIC_DEV_ROUTE}`
    : "/as1dev";
  const secretAdmin = process.env.NEXT_PUBLIC_ADMIN_ROUTE
    ? `/${process.env.NEXT_PUBLIC_ADMIN_ROUTE}`
    : "/as2ad";

  // ১. সাধারণ ইউজার ড্যাশবোর্ড বা প্রটেক্টেড রাউটে ঢুকতে চাইলে
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ২. কেউ যদি সরাসরি সিক্রেট রাউট ছাড়া আসল ফোল্ডারে ঢুকতে চায় (যেমন: /admin), তাকে 404 দেওয়া।
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // ৩. সিক্রেট এডমিন রাউটে ঢুকতে চাইলে
  if (pathname === secretAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL("/developer", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      if (role !== "ADMIN" && role !== "DEVELOPER") {
        return NextResponse.redirect(new URL("/developer", request.url));
      }

      return NextResponse.rewrite(new URL("/developer", request.url));
    } catch {
      return NextResponse.redirect(new URL("/developer", request.url));
    }
  }

  // ৪. সিক্রেট ডেভেলপার রাউটে ঢুকতে চাইলে
  if (pathname === secretDev) {
    if (!token) {
      return NextResponse.rewrite(new URL("/developer", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      if (role !== "DEVELOPER") {
        return NextResponse.redirect(new URL("/developer", request.url));
      }

      return NextResponse.rewrite(new URL("/developer", request.url));
    } catch {
      return NextResponse.rewrite(new URL("/developer", request.url));
    }
  }

  if (pathname === "/developer") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};