// FILE: src/app/dashboard/settings/page.tsx

import {
  Settings,
  ShieldCheck,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) return null;

  const user = await db.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      username: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
          <Settings className="h-3.5 w-3.5" />
          Account Settings
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          View your current account information.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Account Details
              </h2>

              <p className="text-sm text-muted-foreground">
                Your authenticated profile information.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <Row
            label="Username"
            value={
              user.username
                ? `@${user.username}`
                : "Not set"
            }
          />

          <Row
            label="Full Name"
            value={
              user.name ||
              "Not set"
            }
          />

          <Row
            label="Email"
            value={
              user.email
            }
          />

          <Row
            label="Role"
            value={
              user.role
            }
          />

          <Row
            label="Status"
            value={
              user.isActive
                ? "Active"
                : "Disabled"
            }
          />

          <Row
            label="Member Since"
            value={
              user.createdAt.toLocaleDateString()
            }
          />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-sm font-medium">
        {value}
      </span>
    </div>
  );
}
