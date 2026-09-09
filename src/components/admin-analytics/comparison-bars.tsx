// FILE: src/components/admin-analytics/comparison-bars.tsx

export function ComparisonBars({
  title,
  description,
  currentLabel,
  previousLabel,
  data,
  currency = true,
}: {
  title: string;
  description: string;
  currentLabel: string;
  previousLabel: string;
  data: Array<{ name: string; current: number; previous: number }>;
  currency?: boolean;
}) {
  const max = Math.max(...data.flatMap((item) => [item.current, item.previous]), 1);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 space-y-5">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Not enough sales data for this comparison yet.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="min-w-0 truncate text-sm font-semibold">{item.name}</p>
                <div className="flex shrink-0 gap-3 text-[11px] text-muted-foreground">
                  <span>{currentLabel}</span>
                  <span>{previousLabel}</span>
                </div>
              </div>

              <div className="space-y-2">
                <ComparisonBar value={item.current} max={max} label={formatValue(item.current, currency)} emphasis />
                <ComparisonBar value={item.previous} max={max} label={formatValue(item.previous, currency)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ComparisonBar({
  value,
  max,
  label,
  emphasis = false,
}: {
  value: number;
  max: number;
  label: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-accent">
        <div
          className={`h-full rounded-full transition-all ${emphasis ? "bg-indigo-500" : "bg-muted-foreground/30"}`}
          style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-xs font-semibold text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function formatValue(value: number, currency: boolean) {
  if (currency) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  return value.toLocaleString();
}
