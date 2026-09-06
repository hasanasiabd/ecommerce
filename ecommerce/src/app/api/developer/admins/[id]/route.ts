// FILE: src/app/api/developer/admins/[id]/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requireDeveloper() {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "DEVELOPER") {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Developer access required.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
  };
}

/**
 * PATCH
 *
 * Actions:
 * activate
 * disable
 * update
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth =
      await requireDeveloper();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

    const action = body.action;

    const admin =
      await db.user.findUnique({
        where: {
          id,
        },
      });

    if (
      !admin ||
      admin.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator not found.",
        },
        { status: 404 }
      );
    }

    if (
      action === "activate"
    ) {
      const updated =
        await db.user.update({
          where: { id },
          data: {
            isActive: true,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Administrator activated.",
        admin: updated,
      });
    }

    if (
      action === "disable"
    ) {
      const updated =
        await db.user.update({
          where: { id },
          data: {
            isActive: false,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Administrator disabled.",
        admin: updated,
      });
    }

    if (
      action === "update"
    ) {
      const username =
        typeof body.username ===
        "string"
          ? body.username
              .trim()
              .toLowerCase()
          : undefined;

      const email =
        typeof body.email ===
        "string"
          ? body.email
              .trim()
              .toLowerCase()
          : undefined;

      const name =
        typeof body.name ===
        "string"
          ? body.name.trim()
          : undefined;

      if (
        username &&
        !/^[a-z0-9_]{3,30}$/.test(
          username
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid username format.",
          },
          { status: 400 }
        );
      }

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid email address.",
          },
          { status: 400 }
        );
      }

      const updated =
        await db.user.update({
          where: { id },
          data: {
            ...(username !== undefined
              ? { username }
              : {}),
            ...(email !== undefined
              ? { email }
              : {}),
            ...(name !== undefined
              ? { name }
              : {}),
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Administrator updated.",
        admin: updated,
      });
    }

    return NextResponse.json(
      {
        error:
          "Unknown action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Update admin error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update administrator.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 * Reset administrator password.
 */
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const auth =
      await requireDeveloper();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

    if (
      body.action !==
      "reset-password"
    ) {
      return NextResponse.json(
        {
          error:
            "Unknown action.",
        },
        { status: 400 }
      );
    }

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    const admin =
      await db.user.findUnique({
        where: { id },
      });

    if (
      !admin ||
      admin.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator not found.",
        },
        { status: 404 }
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    await db.user.update({
      where: { id },
      data: {
        password:
          passwordHash,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Administrator password reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset admin password error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to reset administrator password.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 * Developer only.
 */
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const auth =
      await requireDeveloper();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } =
      await context.params;

    const admin =
      await db.user.findUnique({
        where: { id },
      });

    if (
      !admin ||
      admin.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator not found.",
        },
        { status: 404 }
      );
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Administrator deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete admin error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete administrator.",
      },
      { status: 500 }
    );
  }
}