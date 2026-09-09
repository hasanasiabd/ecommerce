// FILE: src/components/admin-analytics/trend-chart.tsx

export function TrendChart({
  data,
}: {
  data: Array<{ label: string; revenue: number; orders: number }>;
}) {
  const width = 760;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 42, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const points = data
    .map((item, index) => {
      const x =
        padding.left +
        (data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
      const y =
        padding.top +
        chartHeight - (item.revenue / maxRevenue) * chartHeight;

      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding.left},${padding.top + chartHeight} ${points} ${padding.left + chartWidth},${padding.top + chartHeight}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">Revenue Trend</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paid revenue across the selected reporting period.
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-500">Revenue</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[640px] w-full"
          role="img"
          aria-label="Revenue trend chart"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight - ratio * chartHeight;
            const value = maxRevenue * ratio;

            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="currentColor"
                  opacity="0.55"
                >
                  ${Math.round(value).toLocaleString()}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill="currentColor" opacity="0.05" />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-500"
          />

          {data.map((item, index) => {
            const x =
              padding.left +
              (data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
            const y =
              padding.top +
              chartHeight - (item.revenue / maxRevenue) * chartHeight;

            return (
              <g key={`${item.label}-${index}`}>
                <circle cx={x} cy={y} r="4.5" fill="currentColor" className="text-indigo-500" />
                {index % Math.max(1, Math.ceil(data.length / 7)) === 0 ? (
                  <text
                    x={x}
                    y={height - 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill="currentColor"
                    opacity="0.55"
                  >
                    {item.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
