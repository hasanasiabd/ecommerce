// FILE: src/app/api/checkout/cancel/route.ts

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let body: { orderId?: unknown };

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required." },
      { status: 400 }
    );
  }

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.userId,
    },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 }
    );
  }

  if (order.status !== "PAYMENT_PENDING") {
    return NextResponse.json({
      success: true,
      message: "This checkout is no longer pending.",
      status: order.status,
    });
  }

  if (order.stripeSessionId) {
    try {
      const stripe = getStripe();
      const stripeSession = await stripe.checkout.sessions.retrieve(
        order.stripeSessionId
      );

      if (stripeSession.status === "complete" || stripeSession.payment_status === "paid") {
        return NextResponse.json(
          { error: "Payment was already completed." },
          { status: 409 }
        );
      }

      if (stripeSession.status === "open") {
        await stripe.checkout.sessions.expire(order.stripeSessionId);
      }
    } catch (error) {
      console.error("Stripe cancellation error:", error);

      return NextResponse.json(
        { error: "Unable to safely cancel this payment session." },
        { status: 502 }
      );
    }
  }

  const cancelled = await db.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id: order.id,
        userId: session.userId,
        status: "PAYMENT_PENDING",
      },
      data: {
        status: "CANCELLED",
        paymentStatus: "UNPAID",
      },
    });

    if (result.count !== 1) {
      return false;
    }

    for (const item of order.items) {
      await tx.product.updateMany({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.user.updateMany({
      where: { id: session.userId },
      data: { checkoutLockUntil: null },
    });

    return true;
  });

  return NextResponse.json({
    success: true,
    cancelled,
  });
}
