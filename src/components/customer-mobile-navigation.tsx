// FILE: src/components/customer-mobile-navigation.tsx

"use client";

import { useCallback, useState } from "react";
import {
  Code2,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Menu,
} from "lucide-react";

import {
  MobileDrawer,
  type MobileDrawerItem,
} from "@/components/mobile-drawer";

import { LogoutButton } from "@/components/logout-button";

type CustomerMobileNavigationProps = {
  adminPath: string | null;
  developerPath: string | null;
};

export function CustomerMobileNavigation({
  adminPath,
  developerPath,
}: CustomerMobileNavigationProps) {
  const [open, setOpen] =
    useState(false);

  const handleClose =
    useCallback(() => {
      setOpen(false);
    }, []);

  const items: MobileDrawerItem[] = [
    {
      href: "/",
      label: "Store Home",
      icon: Home,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/orders",
      label: "My Orders",
      icon: Package,
    },
    {
      href: "/dashboard/wishlist",
      label: "Wishlist",
      icon: Heart,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

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
        aria-label="Open customer navigation"
        aria-expanded={open}
        className="
          inline-flex h-10 w-10
          shrink-0 items-center
          justify-center
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
        title="Customer Panel"
        subtitle="MyShop"
        items={items}
      />

      {/*
       * Logout is kept separately because the shared
       * MobileDrawer currently handles navigation links.
       *
       * The actual logout action will still be available
       * from the mobile dashboard header in the layout.
       */}
    </>
  );
}