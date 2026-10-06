"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, XCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import type { StatusResult } from "@/lib/status";

type Result = StatusResult;

const STEPS = ["Applied", "In review", "Shortlisted", "Interview", "Selected"];
const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function StatusTracker({
  initialId,
  initialPhone,
  initial,
}: {
  initialId: string;
  initialPhone: string;
  initial: { result: StatusResult | null; error: string } | null;
}) {
  const [id, setId] = useState(initialId);
  const [phone, setPhone] = useState(initialPhone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initial?.error ?? "");
  const [result, setResult] = useState<Result | null>(initial?.result ?? null);

  async function lookup(cid = id, ph = phone) {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: cid, phone: ph }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't check right now.");
    } finally {
      setBusy(false);
    }
  }


  const closed = result?.stage.step === -1;

  return (
    <div className="mt-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
        className="grid gap-2.5 rounded-3xl border border-line bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(11,31,58,0.4)] sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          value={id}
          onChange={(e) => setId(e.target.value.toUpperCase())}
          placeholder="K-2026-0123"
          aria-label="Candidate ID"
          className="rounded-2xl bg-paper px-4 py-3.5 text-[15px] font-medium outline-none focus:ring-4 focus:ring-teal/20"
          required
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          inputMode="tel"
          aria-label="Mobile number"
          className="rounded-2xl bg-paper px-4 py-3.5 text-[15px] font-medium outline-none focus:ring-4 focus:ring-teal/20"
          required
        />
        <button
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>Check <ArrowRight className="size-4" /></>}
        </button>
      </form>

      {error && <p className="mt-4 animate-pop rounded-2xl bg-coral/10 px-5 py-4 text-center text-[15px] font-medium text-[#b9472b]">{error}</p>}

      {result && (
        <div className="mt-6 animate-pop overflow-hidden rounded-[2rem] border border-line bg-white">
          <div className="bg-ink px-7 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sun">{result.candidateId}</p>
            <p className="mt-1 font-display text-2xl font-semibold">Hi {result.firstName} 👋</p>
            <p className="mt-1 text-white/70">
              {result.role}
              {result.company ? ` · ${result.company}` : ""} · applied {fmt(result.appliedOn)}
            </p>
          </div>
          <div className="p-7">
            <p className={`font-display text-xl font-semibold ${closed ? "text-muted" : "text-teal-deep"}`}>{result.stage.label}</p>
            {!closed ? (
              <ol className="mt-6 grid grid-cols-5 gap-1.5">
                {STEPS.map((s, i) => {
                  const done = i <= result.stage.step;
                  return (
                    <li key={s} className="flex flex-col items-center gap-2 text-center">
                      <span className={`h-2 w-full rounded-full ${done ? "bg-teal" : "bg-paper-2"}`} />
                      <span className={`grid size-8 place-items-center rounded-full ${done ? "bg-teal text-white" : "bg-paper-2 text-muted"}`}>
                        {done ? <Check className="size-4" strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </span>
                      <span className={`text-[11px] font-medium leading-tight sm:text-xs ${done ? "text-ink" : "text-muted"}`}>{s}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-3 flex items-start gap-2 text-[15px] text-muted">
                <XCircle className="mt-0.5 size-5 shrink-0" /> We&apos;ll reach out when a better-fitting role opens up.
              </p>
            )}
            {(result.interviewDate || result.joiningDate) && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {result.interviewDate && (
                  <div className="rounded-2xl bg-sun-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">Interview</p>
                    <p className="mt-1 font-semibold">{fmt(result.interviewDate)}</p>
                  </div>
                )}
                {result.joiningDate && (
                  <div className="rounded-2xl bg-teal-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-deep/70">Joining date</p>
                    <p className="mt-1 font-semibold text-teal-deep">{fmt(result.joiningDate)}</p>
                  </div>
                )}
              </div>
            )}
            <a
              href={whatsappLink(`Hi KelasaHub, I'd like an update on my application ${result.candidateId}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="size-4" /> Ask about my application
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
