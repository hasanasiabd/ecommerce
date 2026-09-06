// FILE: src/components/theme-toggle.tsx

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-24 rounded-xl border border-border bg-card" />
    );
  }

  const dark =
    resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(
          dark
            ? "light"
            : "dark"
        )
      }
      className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        border border-border
        bg-card
        px-3.5 py-2.5
        text-sm font-medium
        transition
        hover:bg-accent
      "
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {dark ? (
        <>
          <Sun className="h-4 w-4" />
          Light
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Dark
        </>
      )}
    </button>
  );
}