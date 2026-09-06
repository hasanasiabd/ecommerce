// FILE: src/app/api/categories/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories =
      await db.category.findMany({
        orderBy: {
          name: "asc",
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
      "Category listing error:",
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