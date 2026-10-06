"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDown, FileText, Loader2, Phone, Trash2, X } from "lucide-react";
import { INTERVIEW_STATUS, OVERALL_STATUS, SCREENING_STATUS, candidateWhatsApp } from "@/lib/constants";
import { bulkUpdate } from "@/app/admin/actions";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import { StatusSelect } from "./StatusSelect";
import { Card, fmtDate, relTime } from "./ui";

export type CandidateRow = {
  id: string;
  candidateId: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  source: string;
  partner: string;
  area: string;
  dateApplied: string;
  screeningStatus: string;
  interviewStatus: string;
  overallStatus: string;
  lastContacted: string | null;
  notes: string;
  dupCount: number;
};

export function CandidateTable({
  rows,
  partners,
  filterQs,
  total,
}: {
  rows: CandidateRow[];
  partners: { id: string; name: string }[];
  filterQs: string;
  total: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [toast, setToast] = useState("");
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const ids = [...selected];

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = (u: Parameters<typeof bulkUpdate>[1]) =>
    start(async () => {
      const r = await bulkUpdate(ids, u);
      setToast(r.ok ? r.message ?? "Done" : r.error);
      if (r.ok) {
        setSelected(new Set());
        router.refresh();
      }
      setTimeout(() => setToast(""), 2500);
    });

  const bulkSel = "rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-sm text-white outline-none [&>option]:text-ink";

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all on this page"
                    checked={allOnPage}
                    onChange={() => setSelected(allOnPage ? new Set() : new Set(rows.map((r) => r.id)))}
                    className="size-4 accent-teal"
                  />
                </th>
                <th className="px-3 py-3">Candidate</th>
                <th className="px-3 py-3">Role · Partner</th>
                <th className="px-3 py-3">Applied</th>
                <th className="px-3 py-3">Screening</th>
                <th className="px-3 py-3">Interview</th>
                <th className="px-3 py-3">Overall</th>
                <th className="px-3 py-3">Notes</th>
                <th className="px-3 py-3 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map((r) => (
                <tr key={r.id} className={`group transition hover:bg-slate-50/70 ${selected.has(r.id) ? "bg-teal-soft/40" : ""}`}>
                  <td className="px-4 py-3 align-top">
                    <input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="mt-1 size-4 accent-teal" />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <Link href={`/admin/candidates/${r.id}`} className="font-semibold text-ink hover:text-teal-deep">
                      {r.name}
                    </Link>
                    {r.dupCount > 1 && (
                      <span title={`This phone number has ${r.dupCount} applications`} className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        {r.dupCount}×
                      </span>
                    )}
                    <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
                      <span className="whitespace-nowrap font-mono">{r.candidateId}</span>
                      <span className="whitespace-nowrap">{r.phone}</span>
                    </div>
                  </td>
                  <td className="max-w-56 px-3 py-3 align-top">
                    <div className="truncate font-medium text-ink/85" title={r.role}>
                      {r.role || "—"}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted">
                      {r.partner || "No partner"} · {r.source}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-top text-ink/80">
                    {fmtDate(r.dateApplied)}
                    <div className="text-xs text-muted">{r.lastContacted ? `contacted ${relTime(r.lastContacted)}` : "not contacted"}</div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <StatusSelect id={r.id} field="screeningStatus" value={r.screeningStatus} options={SCREENING_STATUS} />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <StatusSelect id={r.id} field="interviewStatus" value={r.interviewStatus} options={INTERVIEW_STATUS} />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <StatusSelect id={r.id} field="overallStatus" value={r.overallStatus} options={OVERALL_STATUS} allowEmpty />
                  </td>
                  <td className="max-w-52 px-3 py-3 align-top">
                    <p className="line-clamp-2 text-xs text-ink/70" title={r.notes}>
                      {r.notes || <span className="text-slate-300">—</span>}
                    </p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex justify-end gap-1">
                      <a href={`tel:${r.phone}`} title="Call" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink">
                        <Phone className="size-4" />
                      </a>
                      <a
                        href={candidateWhatsApp(r.phone, `Hi ${r.name.split(" ")[0]}, this is KelasaHub regarding your application for ${r.role}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        className="grid size-8 place-items-center rounded-lg text-[#1da851] transition hover:bg-emerald-50"
                      >
                        <WhatsAppIcon className="size-4" />
                      </a>
                      <a href={`/api/admin/pdf/application?ids=${r.id}`} target="_blank" title="Application form PDF" className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink">
                        <FileText className="size-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-muted">
                    No candidates match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed inset-x-3 bottom-4 z-30 mx-auto flex max-w-5xl animate-pop flex-wrap items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-white shadow-2xl lg:left-64">
          <span className="mr-1 text-sm font-semibold">{selected.size} selected</span>
          <select className={bulkSel} defaultValue="" onChange={(e) => e.target.value && run({ field: "screeningStatus", value: e.target.value })} aria-label="Set screening">
            <option value="">Screening…</option>
            {SCREENING_STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className={bulkSel} defaultValue="" onChange={(e) => e.target.value && run({ field: "interviewStatus", value: e.target.value })} aria-label="Set interview">
            <option value="">Interview…</option>
            {INTERVIEW_STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className={bulkSel} defaultValue="" onChange={(e) => e.target.value && run({ field: "overallStatus", value: e.target.value })} aria-label="Set overall">
            <option value="">Overall…</option>
            {OVERALL_STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className={bulkSel} defaultValue="" onChange={(e) => e.target.value && run({ field: "partner", value: e.target.value === "none" ? "" : e.target.value })} aria-label="Assign partner">
            <option value="">Assign partner…</option>
            <option value="none">— Unassign —</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <a href={`/api/admin/pdf/application?ids=${ids.join(",")}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20">
            <FileText className="size-4" /> Application forms
          </a>
          <a href={`/api/admin/pdf/shortlist?ids=${ids.join(",")}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg bg-sun px-3 py-1.5 text-sm font-semibold text-ink hover:brightness-105">
            <FileDown className="size-4" /> Shortlist PDF
          </a>
          <button
            onClick={() => confirm(`Delete ${selected.size} candidate(s)? This cannot be undone.`) && run({ delete: true })}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-rose-300 hover:bg-white/10"
            title="Delete (admins only)"
          >
            <Trash2 className="size-4" />
          </button>
          {pending && <Loader2 className="size-4 animate-spin" />}
          <button onClick={() => setSelected(new Set())} className="ml-auto grid size-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Clear selection">
            <X className="size-4" />
          </button>
        </div>
      )}

      {selected.size === 0 && total > 0 && (
        <p className="mt-3 text-xs text-muted">
          Tip: tick candidates to bulk-update statuses or generate a{" "}
          <a href={`/api/admin/pdf/shortlist?${filterQs}`} target="_blank" className="font-semibold text-teal-deep hover:underline">
            shortlist PDF of all {total} filtered candidates
          </a>
          .
        </p>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 animate-pop rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}
