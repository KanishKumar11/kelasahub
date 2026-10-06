import Link from "next/link";

/** Single-series daily column chart with per-bar hover tooltips. */
export function DailyBars({ data }: { data: { key: string; label: string; n: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  const ticks = [max, Math.round(max / 2), 0];
  return (
    <div className="mt-5">
      <div className="flex h-48 gap-3">
        <div className="flex flex-col justify-between pb-0 text-right text-[11px] tabular-nums text-muted">
          {ticks.map((t, i) => (
            <span key={i} className="-translate-y-1.5 leading-none">
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex flex-1 items-end gap-[2px] border-b border-black/10">
          {/* recessive gridlines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-black/[0.06]" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-black/[0.06]" />
          {data.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-[4px] bg-teal transition group-hover:bg-teal-deep"
                style={{ height: d.n ? `${(d.n / max) * 100}%` : 0, minHeight: d.n ? 3 : 0 }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block">
                <span className="font-semibold">{d.n}</span> on {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-7 mt-1.5 flex justify-between text-[11px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Horizontal bar list — magnitude by category, direct-labelled. */
export function BarList({
  items,
  total,
  showPct = false,
  className = "",
}: {
  items: { label: string; n: number; href?: string }[];
  total?: number;
  showPct?: boolean;
  className?: string;
}) {
  const max = total ?? Math.max(1, ...items.map((i) => i.n));
  if (!items.length) return <p className={`text-sm text-muted ${className}`}>No data yet</p>;
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((i) => {
        const pct = max ? (i.n / max) * 100 : 0;
        const row = (
          <div className="group" title={`${i.label}: ${i.n}${showPct && total ? ` (${Math.round(pct)}%)` : ""}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink/80 group-hover:text-ink">{i.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">
                {i.n}
                {showPct && total ? <span className="ml-1.5 text-xs font-normal text-muted">{Math.round(pct)}%</span> : null}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal transition-all group-hover:bg-teal-deep" style={{ width: `${Math.max(pct, i.n ? 1.5 : 0)}%` }} />
            </div>
          </div>
        );
        return <li key={i.label}>{i.href ? <Link href={i.href}>{row}</Link> : row}</li>;
      })}
    </ul>
  );
}
