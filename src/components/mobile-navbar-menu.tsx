// FILE: src/components/mobile-navbar-menu.tsx

"use client";

import { useCallback, useState } from "react";
import {
  Boxes,
  Code2,
  Home,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShieldCheck,
  Layers3,
  Menu,
} from "lucide-react";

import {
  MobileDrawer,
  type MobileDrawerItem,
} from "@/components/mobile-drawer";

type MobileNavbarMenuProps = {
  isAuthenticated: boolean;
  adminPath: string | null;
  developerPath: string | null;
};

export function MobileNavbarMenu({
  isAuthenticated,
  adminPath,
  developerPath,
}: MobileNavbarMenuProps) {
  const [open, setOpen] =
    useState(false);

  const handleClose =
    useCallback(() => {
      setOpen(false);
    }, []);

  const items: MobileDrawerItem[] = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/products",
      label: "Products",
      icon: Package,
    },
    {
      href: "/categories",
      label: "Categories",
      icon: Layers3,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingCart,
    },
  ];

  if (isAuthenticated) {
    items.push({
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    });
  }

  if (adminPath) {
    items.push({
      href: adminPath,
      label: "Admin Panel",
      icon: ShieldCheck,
    });
  }

  if (developerPath) {
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
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="
          inline-flex h-10 w-10
          items-center justify-center
          rounded-xl
          border border-border
          bg-card
          text-muted-foreground
          transition
          hover:bg-accent
          hover:text-foreground
          md:hidden
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileDrawer
        open={open}
        onClose={handleClose}
        title="MyShop"
        subtitle="Navigation"
        items={items}
      />
    </>
  );
}