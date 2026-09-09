// FILE: src/lib/admin-analytics.ts

import { db } from "@/lib/db";

export const PAID_PAYMENT_STATUSES = new Set(["PAID"]);

export type AnalyticsRange = 7 | 30 | 90 | 365;

export function normalizeAnalyticsRange(value?: string): AnalyticsRange {
  if (value === "7" || value === "90" || value === "365") {
    return Number(value) as AnalyticsRange;
  }

  return 30;
}

export function getPeriodStart(days: AnalyticsRange, end = new Date()) {
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return start;
}

export function getPreviousPeriodStart(days: AnalyticsRange, currentStart: Date) {
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - days);
  return previousStart;
}

export function isPaidOrder(order: { paymentStatus: string }) {
  return PAID_PAYMENT_STATUSES.has(order.paymentStatus);
}

export type TrendPoint = {
  label: string;
  shortLabel: string;
  revenue: number;
  orders: number;
};

export type ProductPerformance = {
  name: string;
  units: number;
  revenue: number;
};

export type CategoryPerformance = {
  name: string;
  units: number;
  revenue: number;
};

export async function getAdminReports(range: AnalyticsRange) {
  const end = new Date();
  const start = getPeriodStart(range, end);

  const [orders, totalCustomers, totalProducts, totalStock, lowStockProducts, outOfStockProducts] =
    await Promise.all([
      db.order.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          createdAt: true,
          totalAmount: true,
          paymentStatus: true,
          status: true,
          items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.user.count({
        where: {
          role: "USER",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      db.product.count(),
      db.product.aggregate({
        _sum: {
          stock: true,
        },
      }),
      db.product.count({
        where: {
          stock: {
            gt: 0,
            lte: 5,
          },
        },
      }),
      db.product.count({
        where: {
          stock: 0,
        },
      }),
    ]);

  const paidOrders = orders.filter(isPaidOrder);
  const revenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const unitsSold = paidOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const trend = buildTrend(orders, start, end, range);
  const topProducts = buildTopProducts(paidOrders).slice(0, 8);
  const topCategories = buildTopCategories(paidOrders).slice(0, 8);

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    range,
    start,
    end,
    revenue,
    paidOrders: paidOrders.length,
    totalOrders: orders.length,
    averageOrderValue: paidOrders.length ? revenue / paidOrders.length : 0,
    unitsSold,
    newCustomers: totalCustomers,
    totalProducts,
    totalStock: totalStock._sum.stock ?? 0,
    lowStockProducts,
    outOfStockProducts,
    trend,
    topProducts,
    topCategories,
    statusCounts,
  };
}

export async function getAdminAnalysis(range: AnalyticsRange) {
  const now = new Date();
  const currentStart = getPeriodStart(range, now);
  const previousStart = getPreviousPeriodStart(range, currentStart);
  const previousEnd = new Date(currentStart);
  previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);

  const [currentOrders, previousOrders, currentCustomers, previousCustomers] =
    await Promise.all([
      db.order.findMany({
        where: {
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
        select: {
          totalAmount: true,
          paymentStatus: true,
          items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.order.findMany({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
        select: {
          totalAmount: true,
          paymentStatus: true,
          items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.user.count({
        where: {
          role: "USER",
          createdAt: {
            gte: currentStart,
            lte: now,
          },
        },
      }),
      db.user.count({
        where: {
          role: "USER",
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
    ]);

  const current = summarizePeriod(currentOrders);
  const previous = summarizePeriod(previousOrders);

  return {
    range,
    currentStart,
    currentEnd: now,
    previousStart,
    previousEnd,
    current: {
      ...current,
      customers: currentCustomers,
    },
    previous: {
      ...previous,
      customers: previousCustomers,
    },
    productComparison: buildComparison(
      buildTopProducts(currentOrders.filter(isPaidOrder)),
      buildTopProducts(previousOrders.filter(isPaidOrder)),
    ).slice(0, 8),
    categoryComparison: buildComparison(
      buildTopCategories(currentOrders.filter(isPaidOrder)),
      buildTopCategories(previousOrders.filter(isPaidOrder)),
    ).slice(0, 8),
  };
}

function summarizePeriod(
  orders: Array<{
    totalAmount: number;
    paymentStatus: string;
    items: Array<{ quantity: number }>;
  }>,
) {
  const paidOrders = orders.filter(isPaidOrder);
  const revenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const units = paidOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return {
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    revenue,
    averageOrderValue: paidOrders.length ? revenue / paidOrders.length : 0,
    unitsSold: units,
  };
}

function buildTrend(
  orders: Array<{
    createdAt: Date;
    totalAmount: number;
    paymentStatus: string;
  }>,
  start: Date,
  end: Date,
  range: AnalyticsRange,
): TrendPoint[] {
  const bucketCount = range <= 30 ? range : range <= 90 ? 13 : 12;
  const intervalMs = (end.getTime() - start.getTime()) / bucketCount;

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(start.getTime() + intervalMs * index);
    const bucketEnd =
      index === bucketCount - 1
        ? end
        : new Date(start.getTime() + intervalMs * (index + 1));

    const bucketOrders = orders.filter(
      (order) => order.createdAt >= bucketStart && order.createdAt <= bucketEnd,
    );
    const paidOrders = bucketOrders.filter(isPaidOrder);
    const revenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      label: bucketStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      shortLabel: bucketStart.toLocaleDateString("en-US", {
        month: "short",
        day: range <= 30 ? "numeric" : undefined,
      }),
      revenue,
      orders: bucketOrders.length,
    };
  });
}

function buildTopProducts(
  orders: Array<{
    items: Array<{
      quantity: number;
      price: number;
      product: { title: string };
    }>;
  }>,
): ProductPerformance[] {
  const map = new Map<string, ProductPerformance>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = map.get(item.product.title) ?? {
        name: item.product.title,
        units: 0,
        revenue: 0,
      };

      current.units += item.quantity;
      current.revenue += item.price * item.quantity;
      map.set(item.product.title, current);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function buildTopCategories(
  orders: Array<{
    items: Array<{
      quantity: number;
      price: number;
      product: { category: { name: string } };
    }>;
  }>,
): CategoryPerformance[] {
  const map = new Map<string, CategoryPerformance>();

  for (const order of orders) {
    for (const item of order.items) {
      const name = item.product.category.name;
      const current = map.get(name) ?? {
        name,
        units: 0,
        revenue: 0,
      };

      current.units += item.quantity;
      current.revenue += item.price * item.quantity;
      map.set(name, current);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function buildComparison(
  current: Array<{ name: string; units: number; revenue: number }>,
  previous: Array<{ name: string; units: number; revenue: number }>,
) {
  const map = new Map<
    string,
    { name: string; current: number; previous: number }
  >();

  for (const item of current) {
    map.set(item.name, {
      name: item.name,
      current: item.revenue,
      previous: 0,
    });
  }

  for (const item of previous) {
    const entry = map.get(item.name) ?? {
      name: item.name,
      current: 0,
      previous: 0,
    };
    entry.previous = item.revenue;
    map.set(item.name, entry);
  }

  return [...map.values()].sort(
    (a, b) => Math.max(b.current, b.previous) - Math.max(a.current, a.previous),
  );
}
