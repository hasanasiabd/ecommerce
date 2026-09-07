// FILE: src/app/api/checkout/session/route.ts

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CHECKOUT_LOCK_MINUTES,
  CHECKOUT_SESSION_MINUTES,
  getStripe,
  STRIPE_CURRENCY,
} from "@/lib/stripe";

const MAX_ADDRESS_LENGTH = 500;

function getOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost || request.headers.get("host");
  const protocol = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");

  if (!host) {
    throw new Error("Unable to determine application origin.");
  }

  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please sign in as a customer before checkout." },
      { status: 401 }
    );
  }

  let body: { address?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (address.length < 10 || address.length > MAX_ADDRESS_LENGTH) {
    return NextResponse.json(
      { error: "Delivery address must be between 10 and 500 characters." },
      { status: 400 }
    );
  }

  const now = new Date();
  const lockUntil = new Date(now.getTime() + CHECKOUT_LOCK_MINUTES * 60 * 1000);

  let orderId: string | null = null;

  try {
    const result = await db.$transaction(async (tx) => {
      const locked = await tx.user.updateMany({
        where: {
          id: session.userId,
          isActive: true,
          OR: [
            { checkoutLockUntil: null },
            { checkoutLockUntil: { lt: now } },
          ],
        },
        data: {
          checkoutLockUntil: lockUntil,
        },
      });

      if (locked.count !== 1) {
        const existingOrder = await tx.order.findFirst({
          where: {
            userId: session.userId,
            status: "PAYMENT_PENDING",
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, stripeSessionId: true },
        });

        return {
          conflict: true as const,
          existingOrder,
        };
      }

      const cartItems = await tx.cartItem.findMany({
        where: { userId: session.userId },
        include: { product: true },
        orderBy: { createdAt: "asc" },
      });

      if (cartItems.length === 0) {
        throw new CheckoutError("Your cart is empty.", 400);
      }

      const reservedItems: Array<{
        productId: string;
        title: string;
        quantity: number;
        price: number;
      }> = [];

      let total = 0;

      for (const item of cartItems) {
        if (item.quantity < 1) {
          throw new CheckoutError("Your cart contains an invalid quantity.", 400);
        }

        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new CheckoutError(
            `Not enough stock is available for “${item.product.title}”.`,
            409
          );
        }

        const price = Number(item.product.price);
        total += price * item.quantity;
        reservedItems.push({
          productId: item.productId,
          title: item.product.title,
          quantity: item.quantity,
          price,
        });
      }

      const order = await tx.order.create({
        data: {
          userId: session.userId,
          totalAmount: Number(total.toFixed(2)),
          status: "PAYMENT_PENDING",
          paymentStatus: "UNPAID",
          shippingAddress: address,
          items: {
            create: reservedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      return {
        conflict: false as const,
        orderId: order.id,
        items: reservedItems,
        total: Number(total.toFixed(2)),
      };
    });

    if (result.conflict) {
      return NextResponse.json(
        {
          error: "A checkout session is already in progress.",
          orderId: result.existingOrder?.id ?? null,
        },
        { status: 409 }
      );
    }

    orderId = result.orderId;

    const stripe = getStripe();
    const origin = getOrigin(request);
    const expiresAt = Math.floor(
      (Date.now() + CHECKOUT_SESSION_MINUTES * 60 * 1000) / 1000
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: session.userId,
      customer_email: session.email,
      line_items: result.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: STRIPE_CURRENCY,
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.title,
          },
        },
      })),
      metadata: {
        orderId: result.orderId,
        userId: session.userId,
      },
      payment_intent_data: {
        metadata: {
          orderId: result.orderId,
          userId: session.userId,
        },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1&order_id=${encodeURIComponent(result.orderId)}`,
      expires_at: expiresAt,
      locale: "en",
    });

    await db.$transaction([
      db.order.update({
        where: { id: result.orderId },
        data: {
          stripeSessionId: checkoutSession.id,
        },
      }),
      db.user.update({
        where: { id: session.userId },
        data: { checkoutLockUntil: new Date(expiresAt * 1000) },
      }),
    ]);

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    if (orderId) {
      try {
        await db.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId! },
            include: { items: true },
          });

          if (!order || order.status !== "PAYMENT_PENDING") {
            return;
          }

          for (const item of order.items) {
            await tx.product.updateMany({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
              paymentStatus: "UNPAID",
            },
          });

          await tx.user.updateMany({
            where: { id: session.userId },
            data: { checkoutLockUntil: null },
          });
        });
      } catch (cleanupError) {
        console.error("Checkout cleanup error:", cleanupError);
      }
    } else {
      await db.user.updateMany({
        where: { id: session.userId },
        data: { checkoutLockUntil: null },
      });
    }

    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Checkout session error:", error);

    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 }
    );
  }
}

class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}
