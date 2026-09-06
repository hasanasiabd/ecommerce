// FILE: src/app/api/admin/products/route.ts

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

export async function GET() {
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

    const products =
      await db.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
        },
      });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Admin product GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
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

    const body =
      await request.json();

    const title =
      typeof body.title ===
      "string"
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
            "Title, description and category are required.",
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
            "Price must be a valid non-negative number.",
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
            "Stock must be a non-negative integer.",
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
            "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    const product =
      await db.product.create({
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

    return NextResponse.json(
      {
        success: true,
        message:
          "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin product POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create product.",
      },
      { status: 500 }
    );
  }
}