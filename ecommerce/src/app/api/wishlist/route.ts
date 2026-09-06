// FILE: src/app/api/wishlist/route.ts

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireUser() {
  return getSession();
}

export async function GET() {
  try {
    const session = await requireUser();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const items = await db.wishlistItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);

    return NextResponse.json(
      { error: "Unable to load wishlist." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const item = await db.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
      create: {
        userId: session.userId,
        productId,
      },
      update: {},
      include: { product: true },
    });

    return NextResponse.json({
      success: true,
      message: "Added to wishlist.",
      item,
    });
  } catch (error) {
    console.error("Wishlist POST error:", error);

    return NextResponse.json(
      { error: "Unable to update wishlist." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireUser();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    await db.wishlistItem.deleteMany({
      where: {
        userId: session.userId,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist.",
    });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to update wishlist." },
      { status: 500 }
    );
  }
}
