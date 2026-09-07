// FILE: src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

import {
  getSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import {
  getAdminPanelPath,
  getDeveloperPanelPath,
} from "@/lib/env";

export async function POST() {
  const session = await getSession();

  let redirectPath = "/login";

  if (session?.role === "ADMIN") {
    redirectPath = getAdminPanelPath();
  } else if (session?.role === "DEVELOPER") {
    redirectPath = getDeveloperPanelPath();
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
    redirectPath,
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}