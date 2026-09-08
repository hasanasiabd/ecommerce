// FILE: src/app/admin/settings/page.tsx

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Database,
  Globe2,
  KeyRound,
  Palette,
  ServerCog,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { getAdminPanelPath } from "@/lib/env";

export default async function AdminSettingsPage() {
  const session = await getSession();

  if (
    !session ||
    (session.role !== "ADMIN" && session.role !== "DEVELOPER")
  ) {
    return null;
  }

  const adminPath = getAdminPanelPath();

  const configurationChecks = [
    {
      label: "Database",
      value: process.env.DATABASE_URL
        ? "Configured"
        : "Missing",
      icon: Database,
      ok: Boolean(process.env.DATABASE_URL),
    },
    {
      label: "Authentication secret",
      value: process.env.JWT_SECRET
        ? "Configured"
        : "Missing",
      icon: KeyRound,
      ok: Boolean(process.env.JWT_SECRET),
    },
    {
      label: "Cloudinary",
      value:
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
          ? "Configured"
          : "Check environment",
      icon: ServerCog,
      ok: Boolean(
        process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
      ),
    },
    {
      label: "Stripe",
      value: process.env.STRIPE_SECRET_KEY
        ? "Configured"
        : "Check environment",
      icon: ShieldCheck,
      ok: Boolean(
        process.env.STRIPE_SECRET_KEY
      ),
    },
    {
      label: "Email service",
      value: process.env.RESEND_API_KEY
        ? "Configured"
        : "Check environment",
      icon: Bell,
      ok: Boolean(
        process.env.RESEND_API_KEY
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Settings className="h-3.5 w-3.5" />
              Store Configuration
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review core store configuration and environment readiness.
              Secret values are never displayed here.
            </p>
          </div>

          <Link
            href={adminPath}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-accent sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Environment Readiness
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  A high-level check of the services required by MyShop.
                </p>
              </div>

              <ServerCog className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-5 space-y-3">
              {configurationChecks.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Server-side configuration only
                        </p>
                      </div>
                    </div>

                    <span
                      className={
                        item.ok
                          ? "shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600"
                          : "shrink-0 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600"
                      }
                    >
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Store Preferences
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Areas that will receive editable controls in the next
                  settings phase.
                </p>
              </div>

              <Palette className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-5 space-y-3">
              <SettingsItem
                icon={Globe2}
                title="Store Identity"
                description="Store name, branding and public metadata"
              />

              <SettingsItem
                icon={Bell}
                title="Notifications"
                description="Email and operational notification preferences"
              />

              <SettingsItem
                icon={ShieldCheck}
                title="Security"
                description="Session, access and administrative security controls"
              />

              <SettingsItem
                icon={Palette}
                title="Appearance"
                description="Theme and administrator interface preferences"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-sm font-semibold text-indigo-500">
                Current administrator
              </p>

              <p className="mt-1 break-all text-sm text-muted-foreground">
                {session.email}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Role: {session.role}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}