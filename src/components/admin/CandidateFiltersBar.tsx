"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { INTERVIEW_STATUS, OVERALL_STATUS, SCREENING_STATUS } from "@/lib/constants";
import type { CandidateFilters } from "@/lib/candidate-query";

const sel =
  "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/15";

const QUICK = [
  { label: "All", params: {} },
  { label: "New", params: { screening: "New" } },
  { label: "Shortlisted", params: { screening: "Shortlisted" } },
  { label: "Interviews", params: { interview: "Scheduled" } },
  { label: "Selected", params: { overall: "Selected" } },
  { label: "Rejected", params: { screening: "Rejected" } },
];

export function CandidateFiltersBar({
  filters,
  partners,
  sources,
}: {
  filters: CandidateFilters;
  partners: { id: string; name: string }[];
  sources: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(filters.q ?? "");

  const push = (patch: Record<string, string | undefined>, reset = false) => {
    const next = new URLSearchParams(reset ? "" : sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    start(() => router.push(`?${next.toString()}`));
  };

  // Debounced search
  useEffect(() => {
    if ((filters.q ?? "") === q) return;
    const t = setTimeout(() => push({ q: q || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeQuick = QUICK.findIndex((x) => {
    const keys = ["screening", "interview", "overall"] as const;
    return keys.every((k) => (x.params as Record<string, string>)[k] === filters[k]);
  });
  const hasFilters = Object.entries(filters).some(([k, v]) => v && k !== "page" && k !== "sort");

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK.map((x, i) => (
          <button
            key={x.label}
            onClick={() => push({ screening: undefined, interview: undefined, overall: undefined, ...x.params })}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              i === activeQuick ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-black/10 hover:text-ink"
            }`}
          >
            {x.label}
          </button>
        ))}
        {pending && <Loader2 className="ml-2 size-4 animate-spin text-muted" />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email, ID, role, notes…"
            className={`${sel} w-full pl-9`}
          />
        </label>
        <select className={sel} value={filters.screening ?? ""} onChange={(e) => push({ screening: e.target.value || undefined })} aria-label="Screening status">
          <option value="">Screening: any</option>
          {SCREENING_STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={sel} value={filters.interview ?? ""} onChange={(e) => push({ interview: e.target.value || undefined })} aria-label="Interview status">
          <option value="">Interview: any</option>
          {INTERVIEW_STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={sel} value={filters.overall ?? ""} onChange={(e) => push({ overall: e.target.value || undefined })} aria-label="Overall status">
          <option value="">Overall: any</option>
          <option value="none">Not set</option>
          {OVERALL_STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={sel} value={filters.source ?? ""} onChange={(e) => push({ source: e.target.value || undefined })} aria-label="Source">
          <option value="">Source: any</option>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={sel} value={filters.partner ?? ""} onChange={(e) => push({ partner: e.target.value || undefined })} aria-label="Partner">
          <option value="">Partner: any</option>
          <option value="none">Unassigned</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input type="date" className={sel} value={filters.from ?? ""} onChange={(e) => push({ from: e.target.value || undefined })} aria-label="Applied from" />
        <input type="date" className={sel} value={filters.to ?? ""} onChange={(e) => push({ to: e.target.value || undefined })} aria-label="Applied to" />
        <select className={sel} value={filters.sort ?? "newest"} onChange={(e) => push({ sort: e.target.value })} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="contacted">Least recently contacted</option>
          <option value="updated">Recently updated</option>
          <option value="name">Name A–Z</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setQ("");
              push({}, true);
            }}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
          >
            <X className="size-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
