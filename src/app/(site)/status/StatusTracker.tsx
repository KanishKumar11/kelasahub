"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, FileDown, Loader2, MailCheck, XCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import { OtpInput } from "@/components/site/OtpInput";
import { StageProgress } from "@/components/site/StageProgress";
import Link from "next/link";
import type { StatusResult } from "@/lib/status";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function StatusTracker({ initialId, initialEmail }: { initialId: string; initialEmail: string }) {
  const [id, setId] = useState(initialId.toUpperCase());
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StatusResult | null>(null);
  // Set once a code has been requested; shows the code entry step.
  const [sent, setSent] = useState<{ candidateId: string; email: string } | null>(null);
  const [code, setCode] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sent || result) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sent, result]);
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  async function sendCode() {
    const target = { candidateId: id.trim().toUpperCase(), email: email.trim().toLowerCase() };
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "status", ...target }),
      });
      const data = await res.json();
      // A cooldown means a code was sent moments ago — still show the code step.
      if (!res.ok && !(res.status === 429 && data.retryAfter)) throw new Error(data.error);
      if (!res.ok && sent) setError(data.error);
      setSent(target);
      setCode("");
      setResendAt(Date.now() + (data.retryAfter ?? 45) * 1000);
      setNow(Date.now());
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't send the code right now.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(c = code) {
    if (!sent || c.length !== 6) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "status", ...sent, code: c }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.status);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't verify the code.");
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  const reset = () => {
    setSent(null);
    setResult(null);
    setCode("");
    setError("");
  };

  const closed = result?.stage.step === -1;

  return (
    <div className="mt-10">
      {!sent && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
          className="grid gap-2.5 rounded-3xl border-2 border-ink bg-white p-2.5 shadow-[6px_6px_0_var(--color-ink)] sm:grid-cols-[0.8fr_1.2fr_auto]"
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email you applied with"
            aria-label="Email"
            autoComplete="email"
            className="rounded-2xl bg-paper px-4 py-3.5 text-[15px] font-medium outline-none focus:ring-4 focus:ring-teal/20"
            required
          />
          <button
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-ink-2 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Send code <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      )}

      {sent && !result && (
        <div className="animate-pop rounded-[2rem] border-2 border-ink bg-white p-6 text-center shadow-[6px_6px_0_var(--color-ink)] sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-full border-2 border-ink bg-sun">
            <MailCheck className="size-6" />
          </span>
          <p className="mt-4 font-display text-2xl font-bold">Enter your code</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-muted">
            If <span className="font-semibold text-ink">{sent.candidateId}</span> was applied with{" "}
            <span className="font-semibold text-ink">{sent.email}</span>, a 6-digit code is on its way.
          </p>
          <form
            className="mx-auto mt-6 max-w-sm space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <OtpInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setError("");
              }}
              onComplete={verify}
            />
            <button
              disabled={busy || code.length !== 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-2 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Show my status
            </button>
          </form>
          <div className="mt-5 flex items-center justify-center gap-4 text-sm">
            <button type="button" disabled={resendIn > 0 || busy} onClick={sendCode} className="font-semibold text-teal-deep disabled:font-normal disabled:text-muted">
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
            <span className="text-line">|</span>
            <button type="button" onClick={reset} className="font-semibold text-muted hover:text-ink">
              Change details
            </button>
          </div>
          <p className="mt-5 text-xs text-muted">
            No email? Check spam, or{" "}
            <a
              href={whatsappLink(`Hi KelasaHub, I need my application status. Candidate ID: ${sent.candidateId}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-deep underline"
            >
              ask us on WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      {error && <p className="mt-4 animate-pop rounded-2xl bg-coral/10 px-5 py-4 text-center text-[15px] font-medium text-[#b9472b]">{error}</p>}

      {result && (
        <div className="animate-pop overflow-hidden rounded-[2rem] border-2 border-ink bg-white shadow-[6px_6px_0_var(--color-ink)]">
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
              <div className="mt-6">
                <StageProgress step={result.stage.step} />
              </div>
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
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={result.pdfUrl}
                download
                className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink"
              >
                <FileDown className="size-4" /> Application form (PDF)
              </a>
              <a
                href={whatsappLink(`Hi KelasaHub, I'd like an update on my application ${result.candidateId}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                <WhatsAppIcon className="size-4" /> Ask about my application
              </a>
              <button onClick={reset} className="text-sm font-semibold text-muted hover:text-ink">
                Check another
              </button>
            </div>
            <div className="mt-6 rounded-2xl bg-paper px-5 py-4 text-sm">
              You&apos;re signed in on this browser.{" "}
              <Link href="/account" className="font-semibold text-teal-deep underline-offset-4 hover:underline">
                See all your applications →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
