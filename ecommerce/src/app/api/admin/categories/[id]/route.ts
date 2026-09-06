// FILE: src/app/api/admin/categories/[id]/route.ts

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdminAccess() {
  const session =
    await getSession();

  if (!session) {
    return null;
  }

  if (
    session.role !== "ADMIN" &&
    session.role !== "DEVELOPER"
  ) {
    return null;
  }

  return session;
}

function createSlug(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}

export async function PUT(
  request: Request,
  context: Context
) {
  try {
    const session =
      await requireAdminAccess();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        { status: 403 }
      );
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Category name is required.",
        },
        { status: 400 }
      );
    }

    const slug =
      createSlug(name);

    const category =
      await db.category.findUnique({
        where: { id },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        { status: 404 }
      );
    }

    const duplicate =
      await db.category.findFirst({
        where: {
          OR: [
            { name },
            { slug },
          ],
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Another category already uses this name or slug.",
        },
        { status: 409 }
      );
    }

    const updated =
      await db.category.update({
        where: { id },
        data: {
          name,
          slug,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Category updated successfully.",
      category: updated,
    });
  } catch (error) {
    console.error(
      "Admin category PUT error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update category.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: Context
) {
  try {
    const session =
      await requireAdminAccess();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        { status: 403 }
      );
    }

    const { id } =
      await context.params;

    const category =
      await db.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Do not delete a category while
     * products still belong to it.
     */
    if (
      category._count.products > 0
    ) {
      return NextResponse.json(
        {
          error:
            "This category contains products. Move or delete those products before deleting the category.",
        },
        { status: 409 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin category DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete category.",
      },
      { status: 500 }
    );
  }
}