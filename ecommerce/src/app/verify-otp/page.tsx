"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VerifyOtpPage() {
  const [pendingData, setPendingData] = useState<{
    name?: string;
    email: string;
    password?: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("pending_auth");
      if (!savedAuth) {
        router.push("/login");
      } else {
        setPendingData(JSON.parse(savedAuth));
      }
    }
  }, [router]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingData?.email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingData.email,
          code,
          name: pendingData.name,
          password: pendingData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP code");
      }

      localStorage.removeItem("pending_auth");
      router.push("/");
      router.refresh();
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="My Shop Logo"
            width={64}
            height={64}
            className="mx-auto rounded-xl"
          />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Security Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {pendingData?.email || "your email"}
            </span>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              6-Digit Code
            </label>
            <input
              id="code"
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-widest text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}