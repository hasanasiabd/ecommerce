// FILE: src/components/mobile-drawer.tsx

"use client";

import Link from "next/link";
import {
  createPortal,
} from "react-dom";
import {
  useEffect,
  useState,
} from "react";
import type { LucideIcon } from "lucide-react";

export type MobileDrawerItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: MobileDrawerItem[];
};

export function MobileDrawer({
  open,
  onClose,
  title,
  subtitle = "Navigation",
  items,
}: MobileDrawerProps) {
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[9998]
          bg-black/50
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-height Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${title} navigation`}
        className={`
          fixed inset-y-0 left-0 z-[9999]
          flex h-screen
          w-[min(88vw,340px)]
          flex-col
          border-r border-border
          bg-card
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
              <img
                src="/logo.svg"
                alt="MyShop"
                className="h-7 w-7 rounded-md object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                {subtitle}
              </p>

              <h2 className="truncate text-base font-bold text-foreground">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
              border border-border
              bg-background
              text-lg
              text-muted-foreground
              transition
              hover:bg-accent
              hover:text-foreground
              active:scale-95
            "
          >
            <span aria-hidden="true">
              ×
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
            {items.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={onClose}
                    className="
                      flex items-center gap-3
                      rounded-2xl
                      px-4 py-3
                      text-sm font-medium
                      text-muted-foreground
                      transition-all
                      duration-200
                      hover:bg-accent
                      hover:text-foreground
                      active:scale-[0.98]
                    "
                  >
                    <Icon className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      {item.label}
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-4">
          <p className="text-center text-xs text-muted-foreground">
            MyShop
          </p>
        </div>
      </aside>
    </>,
    document.body
  );
}