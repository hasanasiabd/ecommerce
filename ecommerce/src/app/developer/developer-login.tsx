// FILE: src/app/developer/developer-login.tsx

"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Code2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

type Step = "LOGIN" | "OTP";

export default function DeveloperLogin() {
  const router = useRouter();

  const [identity, setIdentity] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [step, setStep] =
    useState<Step>("LOGIN");

  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              identity,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to login."
        );
      }

      if (
        data.requireOtp &&
        data.purpose ===
          "DEVELOPER_LOGIN"
      ) {
        setEmail(data.email);
        setStep("OTP");
        return;
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

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
                "DEVELOPER_LOGIN",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Invalid OTP."
        );
      }

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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="absolute right-5 top-5">
        <ThemeToggle />
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

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Code2 className="h-3.5 w-3.5" />
              Developer Console
            </div>

            <h1 className="mt-4 text-3xl font-bold">
              {step === "LOGIN"
                ? "Developer Login"
                : "Verify OTP"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step === "LOGIN"
                ? "Use your developer credentials to access the control center."
                : `Verification code sent to ${email}.`}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          {step === "LOGIN" ? (
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="developer-identity"
                  className="mb-2 block text-sm font-medium"
                >
                  Email / Username
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="developer-identity"
                    type="text"
                    autoComplete="username"
                    required
                    value={identity}
                    onChange={(event) =>
                      setIdentity(
                        event.target.value
                      )
                    }
                    placeholder="Developer email or username"
                    className="w-full rounded-2xl border border-border bg-background px-11 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="developer-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="developer-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleOtp}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="developer-otp"
                  className="mb-2 block text-sm font-medium"
                >
                  6-Digit OTP
                </label>

                <input
                  id="developer-otp"
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
                  className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-center text-xl font-semibold tracking-[0.45em] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Enter
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("LOGIN");
                  setOtp("");
                  setError("");
                }}
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-accent"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}