// FILE: src/components/admin-analytics/kpi-card.tsx

import type { LucideIcon } from "lucide-react";

export function AdminKpiCard({
  icon: Icon,
  label,
  value,
  helper,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  trend?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Icon className="h-5 w-5" />
        </div>
        {trend ? (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {trend}
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}
