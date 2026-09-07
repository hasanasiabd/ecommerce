// FILE: src/components/developer-mobile-navigation.tsx

"use client";

import { useCallback, useState } from "react";
import {
  ArrowLeft,
  Code2,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  MobileDrawer,
  type MobileDrawerItem,
} from "@/components/mobile-drawer";

type DeveloperMobileNavigationProps = {
  onBack: () => void;
};

export function DeveloperMobileNavigation({
  onBack,
}: DeveloperMobileNavigationProps) {
  const [open, setOpen] =
    useState(false);

  const handleClose =
    useCallback(() => {
      setOpen(false);
    }, []);

  const items: MobileDrawerItem[] = [
    {
      href: "/developer",
      label: "Developer Panel",
      icon: Code2,
    },
    {
      href: "/developer/admins",
      label: "Administrators",
      icon: ShieldCheck,
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
  ];

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open developer navigation"
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
        title="Developer Panel"
        subtitle="MyShop"
        items={items}
      />

      <button
        type="button"
        onClick={onBack}
        className="
          hidden
          items-center gap-2
          rounded-xl
          border border-border
          bg-card
          px-3.5 py-2
          text-sm font-medium
          text-muted-foreground
          transition
          hover:bg-accent
          hover:text-foreground
          lg:inline-flex
        "
      >
        <ArrowLeft className="h-4 w-4" />
        Developer Panel
      </button>
    </>
  );
}