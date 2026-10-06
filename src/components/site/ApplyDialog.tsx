"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, Loader2, MailCheck, MessageCircle, X } from "lucide-react";
import {
  AREAS,
  EXPERIENCE_LEVELS,
  INTL_LANGUAGES,
  LANGUAGES,
  SHIFT_PREFERENCE,
  TALENT_POOL_ROLES,
  whatsappLink,
} from "@/lib/constants";
import { Chip, Field, Honeypot, SelectInput, TextInput } from "./ui";
import { OtpInput } from "./OtpInput";

export type ApplyTarget =
  | { mode: "job"; role: string; jobId?: string; company?: string }
  | { mode: "talent" };

const STEPS_JOB = ["About you", "Experience", "Education"];

export function ApplyDialog({ target, onClose }: { target: ApplyTarget; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const isJob = target.mode === "job";
  const steps = isJob ? STEPS_JOB : ["About you"];

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; duplicate?: boolean } | null>(null);
  const [f, setF] = useState({
    role: isJob ? target.role : TALENT_POOL_ROLES[0],
    name: "",
    phone: "",
    email: "",
    area: "",
    pincode: "",
    nationality: "Indian",
    address: "",
    employmentStatus: "Fresher" as "Fresher" | "Experienced",
    experienceLevel: EXPERIENCE_LEVELS[0] as string,
    expYears: "",
    lastCompany: "",
    languages: [] as string[],
    intlLanguages: [] as string[],
    shiftPreference: "" as string,
    targetSalary: "",
    tenth: "",
    twelfth: "",
    graduate: "",
    postGraduate: "",
    website: "",
  });
  // Email verification: `otp` is non-null while the code screen is showing.
  const [verified, setVerified] = useState<{ email: string; token: string } | null>(null);
  const [otp, setOtp] = useState<{ sentTo: string; code: string } | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!otp) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [otp]);
  const email = f.email.trim().toLowerCase();
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "languages" | "intlLanguages", v: string) =>
    set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function validateStep(): string {
    if (step === 0) {
      if (f.name.trim().length < 2) return "Please enter your full name.";
      if (!/^(\+?91)?[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, ""))) return "Please enter a valid 10-digit mobile number.";
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return "Please enter your email — we'll send a code to verify it.";
      if (f.pincode && !/^\d{6}$/.test(f.pincode)) return "Pincode must be 6 digits.";
    }
    return "";
  }

  async function sendCode() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "apply", email }),
      });
      const data = await res.json();
      if (res.ok || (res.status === 429 && data.retryAfter)) {
        // A cooldown means a code was sent moments ago — show the code screen anyway.
        setOtp({ sentTo: email, code: "" });
        setResendAt(Date.now() + (data.retryAfter ?? 45) * 1000);
        setNow(Date.now());
        if (!res.ok && otp) setError(data.error);
        return;
      }
      throw new Error(data.error);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(code = otp?.code ?? "") {
    if (!otp || code.length !== 6) return setError("Enter the 6-digit code from your email.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "apply", email: otp.sentTo, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const v = { email: otp.sentTo, token: data.token as string };
      setVerified(v);
      setOtp(null);
      if (steps.length > 1) {
        setStep(1);
        setBusy(false);
      } else await submit(v.token);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't verify the code.");
      setOtp((o) => (o ? { ...o, code: "" } : o));
      setBusy(false);
    }
  }

  async function next() {
    const err = validateStep();
    setError(err);
    if (err) return;
    if (step === 0 && verified?.email !== email) return sendCode();
    if (step < steps.length - 1) return setStep(step + 1);
    await submit(verified!.token);
  }

  async function submit(emailToken: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: isJob ? "Job Application Form" : "Talent Pool",
          role: f.role,
          jobId: isJob ? target.jobId : "",
          name: f.name,
          phone: f.phone,
          email,
          emailToken,
          area: f.area,
          pincode: f.pincode,
          nationality: f.nationality,
          address: f.address,
          employmentStatus: isJob ? f.employmentStatus : f.experienceLevel === "Fresher" ? "Fresher" : "Experienced",
          experienceLevel: isJob ? "" : f.experienceLevel,
          expYears: f.expYears,
          lastCompany: f.lastCompany,
          languages: f.languages,
          intlLanguages: f.intlLanguages,
          shiftPreference: f.shiftPreference,
          targetSalary: f.targetSalary,
          education: { tenth: f.tenth, twelfth: f.twelfth, graduate: f.graduate, postGraduate: f.postGraduate },
          website: f.website,
        }),
      });
      const data = await res.json();
      if (data.needsVerification) {
        setVerified(null);
        setStep(0);
      }
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone({ id: data.candidateId, duplicate: data.duplicate });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try WhatsApp instead.");
    } finally {
      setBusy(false);
    }
  }

  const close = () => {
    ref.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === ref.current && close()}
      className="m-auto w-[min(100%-1.5rem,36rem)] max-h-[92dvh] overflow-hidden rounded-3xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/55 backdrop:backdrop-blur-sm open:animate-pop"
    >
      <div className="flex max-h-[92dvh] flex-col">
        {/* Header */}
        <div className="relative overflow-hidden bg-ink px-6 pb-5 pt-6 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-teal/30 blur-3xl" />
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <X className="size-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sun">
            {done ? "Application received" : isJob ? "Apply in under 2 minutes" : "Join the talent pool"}
          </p>
          <h2 className="mt-2 pr-10 font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]">
            {done ? "You're in! 🎉" : isJob ? target.role : "Get matched to the right role"}
          </h2>
          {!done && isJob && target.company && <p className="mt-1 text-sm text-white/70">{target.company}</p>}
          {!done && steps.length > 1 && (
            <div className="mt-5 flex gap-2">
              {steps.map((s, i) => (
                <div key={s} className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-sun transition-all duration-500"
                      style={{ width: i <= step ? "100%" : "0%" }}
                    />
                  </div>
                  <p className={`mt-1.5 text-[11px] font-medium ${i <= step ? "text-white" : "text-white/50"}`}>
                    {i + 1}. {s}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {done ? (
            <Success id={done.id} duplicate={done.duplicate} role={f.role} email={email} onClose={close} />
          ) : otp ? (
            <div className="animate-rise text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full border-2 border-ink bg-sun shadow-[3px_3px_0_var(--color-ink)]">
                <MailCheck className="size-7" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">Check your email</h3>
              <p className="mx-auto mt-2 max-w-xs text-[15px] text-muted">
                We sent a 6-digit code to <span className="font-semibold text-ink">{otp.sentTo}</span>
              </p>
              <form
                className="mx-auto mt-6 max-w-sm space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyCode();
                }}
              >
                <OtpInput
                  value={otp.code}
                  onChange={(code) => {
                    setOtp({ ...otp, code });
                    setError("");
                  }}
                  onComplete={(code) => verifyCode(code)}
                />
                {error && (
                  <p role="alert" className="rounded-xl bg-coral/10 px-4 py-2.5 text-sm font-medium text-[#b9472b]">
                    {error}
                  </p>
                )}
                <button
                  disabled={busy || otp.code.length !== 6}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-2 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  {steps.length > 1 ? "Verify & continue" : "Verify & submit"}
                </button>
              </form>
              <div className="mt-5 flex items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  disabled={resendIn > 0 || busy}
                  onClick={sendCode}
                  className="font-semibold text-teal-deep disabled:font-normal disabled:text-muted"
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </button>
                <span className="text-line">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(null);
                    setError("");
                  }}
                  className="font-semibold text-muted hover:text-ink"
                >
                  Change email
                </button>
              </div>
              <p className="mt-6 text-xs text-muted">Can&apos;t find it? Check your spam or promotions folder.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              className="relative space-y-4"
              noValidate
            >
              <Honeypot value={f.website} onChange={(v) => set("website", v)} />

              {step === 0 && (
                <div key="s0" className="animate-rise space-y-4">
                  {!isJob && (
                    <Field label="Interested role">
                      <SelectInput value={f.role} onChange={(e) => set("role", e.target.value)}>
                        {TALENT_POOL_ROLES.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </SelectInput>
                    </Field>
                  )}
                  <Field label="Full name">
                    <TextInput
                      autoFocus
                      value={f.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Ananya Rao"
                      autoComplete="name"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Mobile number" hint="WhatsApp preferred">
                      <TextInput
                        type="tel"
                        inputMode="tel"
                        value={f.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="10-digit mobile"
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="Email" hint={verified?.email === email ? "✓ verified" : "we'll send a code"}>
                      <TextInput
                        type="email"
                        value={f.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@email.com"
                        autoComplete="email"
                        className={verified?.email === email ? "border-teal bg-teal-soft/40" : ""}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Preferred area">
                      <SelectInput value={f.area} onChange={(e) => set("area", e.target.value)}>
                        <option value="">Select area</option>
                        {AREAS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </SelectInput>
                    </Field>
                    {isJob ? (
                      <Field label="Pincode" hint="optional">
                        <TextInput
                          inputMode="numeric"
                          maxLength={6}
                          value={f.pincode}
                          onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 560016"
                        />
                      </Field>
                    ) : (
                      <Field label="Experience">
                        <SelectInput value={f.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
                          {EXPERIENCE_LEVELS.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </SelectInput>
                      </Field>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div key="s1" className="animate-rise space-y-5">
                  <div>
                    <p className="mb-2 text-[13px] font-medium">Employment status</p>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper-2 p-1.5">
                      {(["Fresher", "Experienced"] as const).map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => set("employmentStatus", s)}
                          className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                            f.employmentStatus === s ? "bg-white text-ink shadow-sm" : "text-muted"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {f.employmentStatus === "Experienced" && (
                    <div className="grid animate-rise gap-4 sm:grid-cols-2">
                      <Field label="Years of experience">
                        <TextInput value={f.expYears} onChange={(e) => set("expYears", e.target.value)} placeholder="e.g. 2" />
                      </Field>
                      <Field label="Last company">
                        <TextInput
                          value={f.lastCompany}
                          onChange={(e) => set("lastCompany", e.target.value)}
                          placeholder="e.g. Teleperformance"
                        />
                      </Field>
                    </div>
                  )}
                  <div>
                    <p className="mb-2 text-[13px] font-medium">Languages you speak</p>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map((l) => (
                        <Chip key={l} active={f.languages.includes(l)} onClick={() => toggle("languages", l)}>
                          {l}
                        </Chip>
                      ))}
                      {INTL_LANGUAGES.map((l) => (
                        <Chip key={l} active={f.intlLanguages.includes(l)} onClick={() => toggle("intlLanguages", l)}>
                          {l} 🌍
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[13px] font-medium">Shift preference</p>
                    <div className="flex flex-wrap gap-2">
                      {SHIFT_PREFERENCE.map((s) => (
                        <Chip key={s} active={f.shiftPreference === s} onClick={() => set("shiftPreference", s)}>
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <Field label="Expected salary (₹/month)" hint="optional">
                    <TextInput
                      inputMode="numeric"
                      value={f.targetSalary}
                      onChange={(e) => set("targetSalary", e.target.value)}
                      placeholder="e.g. 16000"
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div key="s2" className="animate-rise space-y-4">
                  <p className="rounded-xl bg-teal-soft px-4 py-3 text-[13px] text-teal-deep">
                    Fill whatever applies — school / college name and year is enough.
                  </p>
                  <Field label="10th standard">
                    <TextInput value={f.tenth} onChange={(e) => set("tenth", e.target.value)} placeholder="School / year / board" />
                  </Field>
                  <Field label="12th / 2nd PUC">
                    <TextInput value={f.twelfth} onChange={(e) => set("twelfth", e.target.value)} placeholder="College / year" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Graduation">
                      <TextInput value={f.graduate} onChange={(e) => set("graduate", e.target.value)} placeholder="e.g. B.Com, 2024" />
                    </Field>
                    <Field label="Post-graduation">
                      <TextInput value={f.postGraduate} onChange={(e) => set("postGraduate", e.target.value)} placeholder="optional" />
                    </Field>
                  </div>
                  <Field label="Address">
                    <TextInput
                      value={f.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="House / street / area / city"
                      autoComplete="street-address"
                    />
                  </Field>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-xl bg-coral/10 px-4 py-2.5 text-sm font-medium text-[#b9472b]">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="group ml-auto inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ink/20 transition hover:bg-ink-2 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> {step === 0 && verified?.email !== email ? "Sending code" : "Submitting"}
                    </>
                  ) : step === 0 && verified?.email !== email ? (
                    <>
                      Verify email & continue <MailCheck className="size-4" />
                    </>
                  ) : step < steps.length - 1 ? (
                    <>
                      Continue <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </>
                  ) : (
                    <>
                      Submit application <Check className="size-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-muted">100% free · We never charge candidates · No spam</p>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}

function Success({ id, duplicate, role, email, onClose }: { id: string; duplicate?: boolean; role: string; email: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const msg = `Hi KelasaHub, I applied for ${role} on your website. My Candidate ID is ${id}.`;
  return (
    <div className="animate-rise text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal-soft">
        <Check className="size-8 text-teal-deep" strokeWidth={3} />
      </div>
      <p className="mx-auto mt-4 max-w-sm text-[15px] text-muted">
        {duplicate
          ? "You've already applied for this role recently — here's your existing Candidate ID."
          : `Thanks for applying for ${role}. Our team will call you within 3–5 days for a quick screening.`}
      </p>
      <div className="mx-auto mt-6 flex max-w-sm items-center justify-between rounded-2xl border-2 border-dashed border-teal/40 bg-white px-5 py-4">
        <div className="text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Candidate ID</p>
          <p className="font-display text-2xl font-bold tracking-wide">{id}</p>
        </div>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3.5 py-2 text-xs font-semibold transition hover:bg-line"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mx-auto mt-3 max-w-sm text-xs text-muted">
        Save this ID — use it with your email to track your application anytime. We have also emailed you a confirmation.
      </p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink(msg)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <MessageCircle className="size-4" /> Send ID on WhatsApp
        </a>
        <Link
          href={`/status?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`}
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:border-ink/40"
        >
          Track status
        </Link>
      </div>
    </div>
  );
}
