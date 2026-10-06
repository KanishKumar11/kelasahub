import type { QueryFilter, SortOrder } from "mongoose";
import type { CandidateDoc } from "./models";

export type CandidateFilters = {
  q?: string;
  screening?: string;
  interview?: string;
  overall?: string;
  source?: string;
  partner?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: string;
};

export function readFilters(sp: Record<string, string | string[] | undefined>): CandidateFilters {
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return {
    q: pick("q"),
    screening: pick("screening"),
    interview: pick("interview"),
    overall: pick("overall"),
    source: pick("source"),
    partner: pick("partner"),
    from: pick("from"),
    to: pick("to"),
    sort: pick("sort"),
    page: pick("page"),
  };
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildCandidateQuery(f: CandidateFilters) {
  // Built loosely (values come from the URL), typed at the boundary.
  const query: Record<string, unknown> = {};
  if (f.q?.trim()) {
    const rx = new RegExp(escape(f.q.trim()), "i");
    const digits = f.q.replace(/\D/g, "");
    query.$or = [
      { name: rx },
      { email: rx },
      { candidateId: rx },
      { role: rx },
      { notes: rx },
      ...(digits.length >= 4 ? [{ phone: new RegExp(digits) }] : []),
    ];
  }
  if (f.screening) query.screeningStatus = f.screening;
  if (f.interview) query.interviewStatus = f.interview === "Scheduled" ? { $in: ["Scheduled", "Rescheduled"] } : f.interview;
  if (f.overall) query.overallStatus = f.overall === "none" ? "" : f.overall;
  if (f.source) query.source = f.source;
  if (f.partner) query.partner = f.partner === "none" ? null : f.partner;
  if (f.from || f.to) {
    query.dateApplied = {
      ...(f.from ? { $gte: new Date(f.from + "T00:00:00+05:30") } : {}),
      ...(f.to ? { $lte: new Date(f.to + "T23:59:59+05:30") } : {}),
    };
  }
  const sorts: Record<string, Record<string, SortOrder>> = {
    newest: { dateApplied: -1 },
    oldest: { dateApplied: 1 },
    name: { name: 1 },
    contacted: { lastContacted: 1, dateApplied: 1 },
    updated: { updatedAt: -1 },
  };
  return { query: query as QueryFilter<CandidateDoc>, sort: sorts[f.sort ?? "newest"] ?? sorts.newest };
}
