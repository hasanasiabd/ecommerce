// FILE: src/app/verify-otp/page.tsx

"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const queryEmail =
      searchParams.get("email");

    const purpose =
      searchParams.get("purpose");

    if (
      !queryEmail ||
      purpose !== "REGISTRATION"
    ) {
      router.replace("/register");
      return;
    }

    setEmail(queryEmail);
  }, [
    router,
    searchParams,
  ]);

  async function handleVerify(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      loading ||
      !email ||
      otp.length !== 6
    ) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/verify-otp",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              code: otp,
              purpose:
                "REGISTRATION",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to verify OTP."
        );
      }

      /*
       * API already created the session.
       */
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-border bg-card/95 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background">
              <Image
                src="/logo.svg"
                alt="MyShop"
                width={44}
                height={44}
              />
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Email Verification
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Verify your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter the 6-digit code sent to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-indigo-500">
              {email}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium"
              >
                6-Digit Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="123456"
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Use a different email
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}