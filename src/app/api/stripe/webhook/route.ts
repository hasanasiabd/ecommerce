// FILE: src/app/api/stripe/webhook/route.ts

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return secret;
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getWebhookSecret()
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await markOrderPaid(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await cancelPendingOrder(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handling error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function markOrderPaid(stripeSession: Stripe.Checkout.Session) {
  const orderId = stripeSession.metadata?.orderId;
  const userId = stripeSession.metadata?.userId;

  if (!orderId || !userId) {
    return;
  }

  const paymentIntentId =
    typeof stripeSession.payment_intent === "string"
      ? stripeSession.payment_intent
      : stripeSession.payment_intent?.id ?? null;

  await db.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: { items: true },
    });

    if (!order) {
      return;
    }

    if (order.status === "PAID" || order.paymentStatus === "PAID") {
      await tx.user.updateMany({
        where: { id: userId },
        data: { checkoutLockUntil: null },
      });

      return;
    }

    if (order.status !== "PAYMENT_PENDING") {
      return;
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        stripePaymentId: paymentIntentId,
      },
    });

    for (const item of order.items) {
      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: item.productId,
          },
        },
      });

      if (!existingCartItem) {
        continue;
      }

      if (existingCartItem.quantity <= item.quantity) {
        await tx.cartItem.delete({
          where: { id: existingCartItem.id },
        });
      } else {
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity - item.quantity,
          },
        });
      }
    }

    await tx.user.updateMany({
      where: { id: userId },
      data: { checkoutLockUntil: null },
    });
  });
}

async function cancelPendingOrder(stripeSession: Stripe.Checkout.Session) {
  const orderId = stripeSession.metadata?.orderId;
  const userId = stripeSession.metadata?.userId;

  if (!orderId || !userId) {
    return;
  }

  await db.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: { items: true },
    });

    if (!order || order.status !== "PAYMENT_PENDING") {
      return;
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "UNPAID",
      },
    });

    for (const item of order.items) {
      await tx.product.updateMany({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.user.updateMany({
      where: { id: userId },
      data: { checkoutLockUntil: null },
    });
  });
}
