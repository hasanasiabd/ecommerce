// src/app/developer/page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DeveloperPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"LOGIN" | "OTP">("LOGIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // পেজ লোড হওয়ার সময় কুকি চেক করা যাক ইউজার অলরেডি লগইনড কি না
  useEffect(() => {
    const hasSession = document.cookie.includes("myshop_session");
    if (hasSession) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.requireOtp) {
        setStep("OTP");
      } else {
        setIsLoggedIn(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      setIsLoggedIn(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  // যদি ইউজার লগইন করা থাকে, তবে এখানে ডেভেলপার কনসোলের ড্যাশবোর্ড দেখাবে
  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center space-y-4 shadow-2xl">
          <h1 className="text-3xl font-bold text-green-400">Welcome to Developer Console! 🎉</h1>
          <p className="text-gray-400">You have successfully authenticated via secure secret route.</p>
          <button
            onClick={() => {
              document.cookie = "myshop_session=; Max-Age=0; path=/;";
              setIsLoggedIn(false);
              router.refresh();
            }}
            className="rounded-lg bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-500 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="text-center">
          <Image src="/logo.svg" alt="Logo" width={56} height={56} className="mx-auto rounded-xl" />
          <h2 className="mt-4 text-2xl font-bold text-white">
            {step === "LOGIN" ? "Developer Login" : "Enter OTP Verification"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {step === "LOGIN" ? "Enter your credentials to access Developer Console" : `OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        {step === "LOGIN" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email / Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mail@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Processing..." : "Sign in as Developer"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="mt-1 block w-full text-center tracking-widest text-lg rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-500 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify OTP & Enter Console"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}