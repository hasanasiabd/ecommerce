// FILE: src/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE =
  "myshop_session";

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is not configured correctly."
    );
  }

  return new TextEncoder().encode(secret);
}

function getPanelPath(
  value: string | undefined,
  fallback: string
) {
  if (!value) {
    return fallback;
  }

  return value.startsWith("/")
    ? value
    : `/${value}`;
}

async function getRole(
  request: NextRequest
) {
  const token =
    request.cookies.get(
      SESSION_COOKIE
    )?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        getJwtSecret(),
        {
          algorithms: ["HS256"],
        }
      );

    if (
      payload.role !== "USER" &&
      payload.role !== "ADMIN" &&
      payload.role !== "DEVELOPER"
    ) {
      return null;
    }

    return payload.role;
  } catch {
    return null;
  }
}

export async function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const adminPath =
    getPanelPath(
      process.env.ADMIN_PANEL_PATH,
      "/as2ad"
    );

  const developerPath =
    getPanelPath(
      process.env.DEVELOPER_PANEL_PATH,
      "/as1dev"
    );

  /*
   * ========================================================
   * BLOCK PUBLIC ADMIN URL
   * ========================================================
   */

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return NextResponse.rewrite(
      new URL(
        "/404",
        request.url
      )
    );
  }

  /*
   * ========================================================
   * BLOCK PUBLIC DEVELOPER URL
   * ========================================================
   */

  if (
    pathname === "/developer" ||
    pathname.startsWith("/developer/")
  ) {
    return NextResponse.rewrite(
      new URL(
        "/404",
        request.url
      )
    );
  }

  /*
   * ========================================================
   * SECRET ADMIN ROUTE
   * ========================================================
   */

  if (
    pathname === adminPath ||
    pathname.startsWith(
      `${adminPath}/`
    )
  ) {
    const role =
      await getRole(request);

    /*
     * Not logged in:
     * allow secret route to show
     * admin login UI.
     */

    if (!role) {
      return NextResponse.rewrite(
        new URL(
          "/admin",
          request.url
        )
      );
    }

    /*
     * ADMIN + DEVELOPER
     * both can enter Admin Panel.
     */

    if (
      role !== "ADMIN" &&
      role !== "DEVELOPER"
    ) {
      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url
        )
      );
    }

    return NextResponse.rewrite(
      new URL(
        pathname.replace(
          adminPath,
          "/admin"
        ) || "/admin",
        request.url
      )
    );
  }

  /*
   * ========================================================
   * SECRET DEVELOPER ROUTE
   * ========================================================
   */

  if (
    pathname === developerPath ||
    pathname.startsWith(
      `${developerPath}/`
    )
  ) {
    const role =
      await getRole(request);

    /*
     * Not logged in:
     * show developer login UI.
     */

    if (!role) {
      return NextResponse.rewrite(
        new URL(
          "/developer",
          request.url
        )
      );
    }

    /*
     * ONLY DEVELOPER
     */

    if (role !== "DEVELOPER") {
      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url
        )
      );
    }

    return NextResponse.rewrite(
      new URL(
        pathname.replace(
          developerPath,
          "/developer"
        ) || "/developer",
        request.url
      )
    );
  }

  /*
   * ========================================================
   * CUSTOMER PANEL
   * ========================================================
   */

  if (
    pathname === "/dashboard" ||
    pathname.startsWith(
      "/dashboard/"
    ) ||
    pathname === "/profile" ||
    pathname.startsWith(
      "/profile/"
    )
  ) {
    const role =
      await getRole(request);

    if (!role) {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};