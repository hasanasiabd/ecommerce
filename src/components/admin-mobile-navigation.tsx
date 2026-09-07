// FILE: src/components/admin-mobile-navigation.tsx

"use client";

import { useCallback, useState } from "react";
import {
  Boxes,
  Code2,
  LayoutDashboard,
  Menu,
  PackageSearch,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import {
  MobileDrawer,
  type MobileDrawerItem,
} from "@/components/mobile-drawer";

type AdminMobileNavigationProps = {
  adminPath: string;
  developerPath: string;
  isDeveloper: boolean;
};

export function AdminMobileNavigation({
  adminPath,
  developerPath,
  isDeveloper,
}: AdminMobileNavigationProps) {
  const [open, setOpen] =
    useState(false);

  const handleClose =
    useCallback(() => {
      setOpen(false);
    }, []);

  const items: MobileDrawerItem[] = [
    {
      href: adminPath,
      label: "Admin Panel",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard",
      label: "Customer Panel",
      icon: UserRound,
    },
    {
      href: "/",
      label: "Store Home",
      icon: LayoutDashboard,
    },
    {
      href: `${adminPath}/products`,
      label: "Products",
      icon: PackageSearch,
    },
    {
      href: `${adminPath}/categories`,
      label: "Categories",
      icon: Boxes,
    },
    {
      href: `${adminPath}/orders`,
      label: "Orders",
      icon: ShoppingCart,
    },
  ];

  if (isDeveloper) {
    items.push({
      href: developerPath,
      label: "Developer Panel",
      icon: Code2,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open admin navigation"
        aria-expanded={open}
        className="
          inline-flex h-10 w-10
          shrink-0
          items-center justify-center
          rounded-xl
          border border-border
          bg-card
          text-muted-foreground
          transition
          hover:bg-accent
          hover:text-foreground
          lg:hidden
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileDrawer
        open={open}
        onClose={handleClose}
        title="Admin Panel"
        subtitle="MyShop"
        items={items}
      />
    </>
  );
}