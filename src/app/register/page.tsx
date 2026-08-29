"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // OTP ভেরিফিকেশনের জন্য ইউজারের নাম, ইমেইল ও পাসওয়ার্ড জমা রাখা
      localStorage.setItem(
        "pending_auth",
        JSON.stringify({ name, email, password })
      );

      // OTP ভেরিফিকেশন পেজে পাঠানো
      router.push("/verify-otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={56}
            height={56}
            className="mx-auto rounded-xl"
          />
          <h2 className="mt-4 text-2xl font-bold text-white">Create an account</h2>
          <p className="mt-1 text-sm text-gray-400">
            Join us to get started with your account.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.com"
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
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
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}