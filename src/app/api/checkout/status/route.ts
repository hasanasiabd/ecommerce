// FILE: src/app/api/checkout/status/route.ts

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim();

  if (!sessionId) {
    return NextResponse.json(
      { error: "Checkout session ID is required." },
      { status: 400 }
    );
  }

  const order = await db.order.findFirst({
    where: {
      userId: session.userId,
      stripeSessionId: sessionId,
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 }
    );
  }

  let stripeStatus: string | null = null;
  let stripePaymentStatus: string | null = null;

  try {
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId);
    stripeStatus = stripeSession.status;
    stripePaymentStatus = stripeSession.payment_status;
  } catch (error) {
    console.error("Stripe status lookup error:", error);
  }

  return NextResponse.json({
    success: true,
    order: {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    },
    stripe: {
      status: stripeStatus,
      paymentStatus: stripePaymentStatus,
    },
  });
}
