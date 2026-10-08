"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, MailCheck } from "lucide-react";
import { OtpInput } from "./OtpInput";

/** Email → 6-digit code sign-in for candidates. No passwords to remember. */
export function CandidateSignIn({ onSignedIn, initialEmail = "" }: { onSignedIn: () => void | Promise<void>; initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sentTo) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sentTo]);
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  async function send() {
    const target = email.trim().toLowerCase();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "login", email: target }) });
      const data = await res.json().catch(() => ({}));
      // A cooldown means a code went out moments ago — still show the code step.
      if (!res.ok && !(res.status === 429 && data.retryAfter)) throw new Error(data.error);
      if (!res.ok && sentTo) setError(data.error);
      setSentTo(target);
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
    if (!sentTo || c.length !== 6) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "login", email: sentTo, code: c }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      await onSignedIn();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't verify the code.");
      setCode("");
      setBusy(false);
    }
  }

  const input = "w-full rounded-2xl border-2 border-ink bg-white px-4 py-3.5 text-[15px] font-medium outline-none transition focus:ring-4 focus:ring-sun/50";

  if (!sentTo)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="space-y-3"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Your email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} />
        </label>
        <button disabled={busy} className="btn-pop inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3.5 text-sm font-bold text-ink disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>Email me a sign-in code <ArrowRight className="size-4" /></>}
        </button>
        {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-[#b9472b]">{error}</p>}
        <p className="text-xs leading-relaxed text-muted">Use the email you applied with to see your applications. New here? Any email works — your account is created when you sign in.</p>
      </form>
    );

  return (
    <div className="text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full border-2 border-ink bg-sun">
        <MailCheck className="size-5" />
      </span>
      <p className="mt-3 font-display text-xl font-bold">Check your inbox</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
        We sent a 6-digit code to <span className="font-semibold text-ink">{sentTo}</span>.
      </p>
      <form
        className="mt-5 space-y-4"
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
        <button disabled={busy || code.length !== 6} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-2 disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Sign in
        </button>
      </form>
      {error && <p className="mt-3 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-[#b9472b]">{error}</p>}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <button type="button" disabled={resendIn > 0 || busy} onClick={send} className="font-semibold text-teal-deep disabled:font-normal disabled:text-muted">
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        <span className="text-line">|</span>
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setError("");
          }}
          className="font-semibold text-muted hover:text-ink"
        >
          Change email
        </button>
      </div>
    </div>
  );
}
