import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(11,31,58,0.04)] ${className}`}>{children}</div>;
}

const TONES: Record<string, string> = {
  // screening
  New: "bg-sky-50 text-sky-700 ring-sky-600/15",
  "In Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Shortlisted: "bg-teal-soft text-teal-deep ring-teal/25",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
  // interview
  "Not Scheduled": "bg-slate-100 text-slate-600 ring-slate-500/15",
  Scheduled: "bg-violet-50 text-violet-700 ring-violet-600/15",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  "No Show": "bg-rose-50 text-rose-700 ring-rose-600/15",
  Rescheduled: "bg-amber-50 text-amber-700 ring-amber-600/20",
  // overall
  "In Progress": "bg-sky-50 text-sky-700 ring-sky-600/15",
  Selected: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  "Dropped Out": "bg-slate-100 text-slate-600 ring-slate-500/15",
  // leads
  Contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Quoted: "bg-violet-50 text-violet-700 ring-violet-600/15",
  Won: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  Lost: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

export function toneFor(v: string) {
  return TONES[v] ?? "bg-slate-50 text-slate-500 ring-slate-500/10";
}

export function Badge({ value }: { value: string }) {
  if (!value) return <span className="text-xs text-slate-400">—</span>;
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneFor(value)}`}>{value}</span>;
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-2 disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-slate-50 disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50",
};

export const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal focus:ring-4 focus:ring-teal/15";

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted ${className}`}>{children}</span>;
}

export function fmtDate(d?: Date | string | null, withTime = false) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });
}

export function relTime(d?: Date | string | null) {
  if (!d) return "—";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(d);
}

/** yyyy-mm-dd for <input type="date"> */
export function toDateInput(d?: Date | string | null) {
  if (!d) return "";
  const date = new Date(d);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
