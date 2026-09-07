// FILE: src/app/api/admin/orders/[id]/route.ts

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const VALID_STATUSES = [
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

type Context = {
  params: Promise<{ id: string }>;
};

async function requireAdmin() {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DEVELOPER")) {
    return null;
  }

  return session;
}

export async function GET(_request: Request, context: Context) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
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

  return NextResponse.json({ success: true, order });
}

export async function PATCH(request: Request, context: Context) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  let body: { status?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const status = typeof body.status === "string" ? body.status : "";

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json(
      { error: "Invalid order status." },
      { status: 400 }
    );
  }

  try {
    const order = await db.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const nextStatus = status as OrderStatus;

    if (order.status === "CANCELLED" || order.status === "DELIVERED") {
      return NextResponse.json(
        { error: "This order can no longer be changed." },
        { status: 409 }
      );
    }

    if (order.status === "PAYMENT_PENDING" && nextStatus !== "CANCELLED") {
      return NextResponse.json(
        { error: "A pending payment must be completed or canceled before fulfillment." },
        { status: 409 }
      );
    }

    if (order.status === "PAYMENT_PENDING" && nextStatus === "CANCELLED" && order.stripeSessionId) {
      try {
        const stripe = getStripe();
        const stripeSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

        if (stripeSession.status === "complete" || stripeSession.payment_status === "paid") {
          return NextResponse.json(
            { error: "Payment has already completed; this order requires the payment workflow before cancellation." },
            { status: 409 }
          );
        }

        if (stripeSession.status === "open") {
          await stripe.checkout.sessions.expire(order.stripeSessionId);
        }
      } catch (error) {
        console.error("Admin Stripe cancellation error:", error);
        return NextResponse.json(
          { error: "Unable to safely cancel the pending payment session." },
          { status: 502 }
        );
      }
    }

    if (order.status !== "PAYMENT_PENDING" && nextStatus === "CANCELLED") {
      return NextResponse.json(
        { error: "Paid orders require a refund workflow before cancellation." },
        { status: 409 }
      );
    }

    const allowedTransitions: Record<string, string[]> = {
      PAID: ["PROCESSING"],
      PROCESSING: ["SHIPPED"],
      SHIPPED: ["DELIVERED"],
    };

    if (
      order.status !== nextStatus &&
      order.status !== "PAYMENT_PENDING" &&
      !allowedTransitions[order.status]?.includes(nextStatus)
    ) {
      return NextResponse.json(
        { error: `Cannot move an order from ${order.status} to ${nextStatus}.` },
        { status: 409 }
      );
    }

    if (order.status === nextStatus) {
      return NextResponse.json({
        success: true,
        message: "Order status is already set to this value.",
        order,
      });
    }

    const updated = await db.$transaction(async (tx) => {
      if (order.status === "PAYMENT_PENDING" && nextStatus === "CANCELLED") {
        const changed = await tx.order.updateMany({
          where: { id, status: "PAYMENT_PENDING" },
          data: {
            status: "CANCELLED",
            paymentStatus: "UNPAID",
          },
        });

        if (changed.count !== 1) {
          throw new Error("ORDER_STATE_CHANGED");
        }

        for (const item of await tx.orderItem.findMany({
          where: { orderId: id },
        })) {
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.user.updateMany({
          where: { id: order.userId },
          data: { checkoutLockUntil: null },
        });

        return tx.order.findUniqueOrThrow({ where: { id } });
      }

      return tx.order.update({
        where: { id },
        data: { status: nextStatus },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_STATE_CHANGED") {
      return NextResponse.json(
        { error: "The order changed before this update completed." },
        { status: 409 }
      );
    }

    console.error("Admin order PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update order." },
      { status: 500 }
    );
  }
}
