// src/app/admin/layout.tsx

import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // ইউজার যদি লগইন না থাকে বা Admin/Developer রোল না থাকে, তবে সাইডবার ছাড়াই শুধু পেজ (লগইন ফর্ম) দেখাবে
  if (!session || (session.role !== "ADMIN" && session.role !== "DEVELOPER")) {
    return <>{children}</>;
  }

  // লগইন থাকলে নরমাল লেআউট ও সাইডবার দেখাবে
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="w-64 border-r border-gray-800 p-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        {/* Navigation links */}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}