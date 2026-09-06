// FILE: src/components/customer-navigation.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  Settings,
} from "lucide-react";

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    name: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function CustomerNavigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;

        const active =
          pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3
              rounded-xl px-4 py-3
              text-sm font-medium
              transition
              ${
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}