// FILE: src/app/api/admin/categories/route.ts

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

    const categories =
      await db.category.findMany({
        orderBy: {
          createdAt: "desc",
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
      categories,
    });
  } catch (error) {
    console.error(
      "Admin category GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load categories.",
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

    if (
      name.length < 2 ||
      name.length > 80
    ) {
      return NextResponse.json(
        {
          error:
            "Category name must be between 2 and 80 characters.",
        },
        { status: 400 }
      );
    }

    const slug =
      createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "Unable to generate a valid slug.",
        },
        { status: 400 }
      );
    }

    const existing =
      await db.category.findFirst({
        where: {
          OR: [
            { name },
            { slug },
          ],
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A category with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    const category =
      await db.category.create({
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

    return NextResponse.json(
      {
        success: true,
        message:
          "Category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin category POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create category.",
      },
      { status: 500 }
    );
  }
}