// FILE: src/app/api/cart/route.ts

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireUser() {
  const session = await getSession();

  if (!session) return null;

  return session;
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

    const items = await db.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalItems = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const subtotal = items.reduce(
      (sum, item) =>
        sum + item.quantity * item.product.price,
      0
    );

    return NextResponse.json({
      success: true,
      items,
      summary: {
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Cart GET error:", error);

    return NextResponse.json(
      { error: "Unable to load cart." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();

    if (!session) {
      return NextResponse.json(
        { error: "Please sign in before adding items to cart." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    const requestedQuantity =
      Number(body.quantity ?? 1);

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return NextResponse.json(
        { error: "Quantity must be a positive integer." },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    if (product.stock < 1) {
      return NextResponse.json(
        { error: "This product is out of stock." },
        { status: 409 }
      );
    }

    const existing = await db.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
    });

    const nextQuantity =
      (existing?.quantity ?? 0) +
      requestedQuantity;

    if (nextQuantity > product.stock) {
      return NextResponse.json(
        {
          error: `Only ${product.stock} item(s) are available.`,
        },
        { status: 409 }
      );
    }

    const item = existing
      ? await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: nextQuantity },
          include: { product: true },
        })
      : await db.cartItem.create({
          data: {
            userId: session.userId,
            productId,
            quantity: requestedQuantity,
          },
          include: { product: true },
        });

    return NextResponse.json({
      success: true,
      message: "Product added to cart.",
      item,
    });
  } catch (error) {
    console.error("Cart POST error:", error);

    return NextResponse.json(
      { error: "Unable to add product to cart." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const quantity = Number(body.quantity);

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        {
          error: `Only ${product.stock} item(s) are available.`,
        },
        { status: 409 }
      );
    }

    const item = await db.cartItem.update({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Cart PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update cart item." },
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

    const body = await request.json().catch(() => ({}));

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    if (productId) {
      await db.cartItem.deleteMany({
        where: {
          userId: session.userId,
          productId,
        },
      });
    } else {
      await db.cartItem.deleteMany({
        where: {
          userId: session.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: productId
        ? "Cart item removed."
        : "Cart cleared.",
    });
  } catch (error) {
    console.error("Cart DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to update cart." },
      { status: 500 }
    );
  }
}
