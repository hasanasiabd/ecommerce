// FILE: src/app/api/products/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const category =
      searchParams.get("category")?.trim() || "";

    const sort =
      searchParams.get("sort") || "newest";

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || 12),
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                },
              },
              {
                description: {
                  contains: search,
                },
              },
            ],
          }
        : {}),

      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
    };

    const orderBy =
      sort === "price-low"
        ? { price: "asc" as const }
        : sort === "price-high"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const [products, total] =
      await Promise.all([
        db.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            category: true,
          },
        }),

        db.product.count({
          where,
        }),
      ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
      },
    });
  } catch (error) {
    console.error(
      "Product listing error:",
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