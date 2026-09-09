// FILE: src/middleware.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE =
  "myshop_session";

type Role =
  | "USER"
  | "ADMIN"
  | "DEVELOPER";

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET;

  if (
    !secret ||
    secret.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must be configured and at least 32 characters long."
    );
  }

  return new TextEncoder().encode(
    secret
  );
}

function requireRoute(
  name: string
) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is missing from environment variables.`
    );
  }

  return value.startsWith("/")
    ? value
    : `/${value}`;
}

async function getRole(
  request: NextRequest
): Promise<Role | null> {
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

function rewrite(
  request: NextRequest,
  path: string,
  shell?: "admin"
) {
  const requestHeaders = new Headers(request.headers);

  if (shell) {
    requestHeaders.set("x-myshop-shell", shell);
  }

  return NextResponse.rewrite(
    new URL(path, request.url),
    { request: { headers: requestHeaders } }
  );
}

function redirect(
  request: NextRequest,
  path: string
) {
  return NextResponse.redirect(
    new URL(
      path,
      request.url
    )
  );
}

export async function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const adminPath =
    requireRoute(
      "ADMIN_PANEL_PATH"
    );

  const developerPath =
    requireRoute(
      "DEVELOPER_PANEL_PATH"
    );

  /*
   * ============================================================
   * NEVER expose internal panel URLs
   * ============================================================
   */

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return rewrite(
      request,
      "/404"
    );
  }

  if (
    pathname === "/developer" ||
    pathname.startsWith("/developer/")
  ) {
    return rewrite(
      request,
      "/404"
    );
  }

  /*
   * ============================================================
   * DEVELOPER SECRET ROUTE
   * ============================================================
   *
   * Everything under the secret route maps internally
   * to /developer/*
   *
   * Example:
   *
   * ENV secret + /admins
   *        ↓
   * /developer/admins
   * ============================================================
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
     * show Developer login page.
     */

    if (!role) {
      return rewrite(
        request,
        pathname.replace(
          developerPath,
          "/developer"
        ) || "/developer"
      );
    }

    /*
     * Developer only.
     */

    if (
      role !== "DEVELOPER"
    ) {
      return redirect(
        request,
        "/dashboard"
      );
    }

    const internalPath =
      pathname.replace(
        developerPath,
        "/developer"
      ) || "/developer";

    return rewrite(
      request,
      internalPath
    );
  }

  /*
   * ============================================================
   * ADMIN SECRET ROUTE
   * ============================================================
   *
   * Everything under the secret route maps internally
   * to /admin/*
   * ============================================================
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
     * show Admin login page.
     */

    if (!role) {
      return rewrite(
        request,
        pathname.replace(
          adminPath,
          "/admin"
        ) || "/admin",
        "admin"
      );
    }

    /*
     * ADMIN + DEVELOPER
     */

    if (
      role !== "ADMIN" &&
      role !== "DEVELOPER"
    ) {
      return redirect(
        request,
        "/dashboard"
      );
    }

    const internalPath =
      pathname.replace(
        adminPath,
        "/admin"
      ) || "/admin";

    return rewrite(
      request,
      internalPath,
      "admin"
    );
  }

  /*
   * ============================================================
   * CUSTOMER PANEL
   * ============================================================
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
      return redirect(
        request,
        "/login"
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
