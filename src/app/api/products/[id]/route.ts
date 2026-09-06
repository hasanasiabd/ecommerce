// FILE: src/app/api/products/[id]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: Context
) {
  try {
    const { id } =
      await context.params;

    const product =
      await db.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Product detail error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load product.",
      },
      { status: 500 }
    );
  }
}