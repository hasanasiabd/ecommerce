// FILE: src/components/panel-navigation.tsx

import Link from "next/link";
import {
  Code2,
  Home,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath } from "@/lib/env";
import { getDeveloperPanelPath } from "@/lib/env";

type Panel =
  | "customer"
  | "admin"
  | "developer";

export async function PanelNavigation({
  current,
}: {
  current: Panel;
}) {
  const session =
    await getSession();

  if (!session) {
    return null;
  }

  const adminPath =
    getAdminPanelPath();

  const developerPath =
    getDeveloperPanelPath();

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>

      {current !==
        "customer" && (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
        >
          <UserRound className="h-4 w-4" />
          Customer Panel
        </Link>
      )}

      {session.role !==
        "USER" &&
        current !== "admin" && (
          <Link
            href={adminPath}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </Link>
        )}

      {session.role ===
        "DEVELOPER" &&
        current !==
          "developer" && (
          <Link
            href={developerPath}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-500 transition hover:bg-indigo-500/20"
          >
            <Code2 className="h-4 w-4" />
            Developer Panel
          </Link>
        )}
    </nav>
  );
}