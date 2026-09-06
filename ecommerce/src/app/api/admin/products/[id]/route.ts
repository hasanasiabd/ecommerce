// FILE: src/app/api/admin/products/[id]/route.ts

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdmin() {
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

export async function PUT(
  request: Request,
  context: Context
) {
  try {
    const session =
      await requireAdmin();

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

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const price =
      Number(body.price);

    const stock =
      Number(body.stock);

    const categoryId =
      typeof body.categoryId ===
      "string"
        ? body.categoryId
        : "";

    const images =
      typeof body.images ===
      "string"
        ? body.images
        : "[]";

    if (
      !title ||
      !description ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          error:
            "Required product fields are missing.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid stock quantity.",
        },
        { status: 400 }
      );
    }

    const category =
      await db.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Category not found.",
        },
        { status: 400 }
      );
    }

    const product =
      await db.product.update({
        where: { id },
        data: {
          title,
          description,
          price,
          stock,
          categoryId,
          images,
        },
        include: {
          category: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "Admin product PUT error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update product.",
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
      await requireAdmin();

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

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin product DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete product.",
      },
      { status: 500 }
    );
  }
}