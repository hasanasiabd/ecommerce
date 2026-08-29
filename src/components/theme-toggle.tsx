// src/components/theme-toggle.tsx

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // পেজ লোড হওয়ার পর মাউন্ট চেক নিশ্চিত করা
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-20 rounded-lg border border-gray-200 dark:border-gray-800" />
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label="Toggle Theme"
    >
      {resolvedTheme === "dark" ? (
        <>
          <span>☀️</span>
          <span>Light</span>
        </>
      ) : (
        <>
          <span>🌙</span>
          <span>Dark</span>
        </>
      )}
    </button>
  );
}