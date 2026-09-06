"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  children: ReactNode;
  className?: string;
};

export function LogoutButton({
  children,
  className = "",
}: LogoutButtonProps) {
  const router = useRouter();

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [showMessage, setShowMessage] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setErrorMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to logout."
        );
      }

      setShowMessage(true);

      window.setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } catch (error) {
      setLoggingOut(false);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to logout."
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-busy={loggingOut}
        className={className}
      >
        {loggingOut
          ? "Signing out..."
          : children}
      </button>

      {showMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-5 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-500/20 bg-card px-4 py-3 shadow-2xl ring-1 ring-black/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Logged out successfully
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Redirecting you to the login page...
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-red-500/20 bg-card px-4 py-3 text-sm font-medium text-red-500 shadow-2xl"
        >
          {errorMessage}
        </div>
      )}
    </>
  );
}