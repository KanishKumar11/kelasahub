"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, Mail, Phone } from "lucide-react";
import { BUSINESS_TYPES, SITE, whatsappLink } from "@/lib/constants";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./BrandIcons";

const empty = { name: "", company: "", designation: "", businessType: BUSINESS_TYPES[0] as string, phone: "", headcount: "", website: "" };

export function Business({ partners = [] }: { partners?: string[] }) {
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setF(empty);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't send — please call or WhatsApp us.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-sun focus:bg-white/10";

  return (
    <section id="business" className="scroll-mt-20 px-4 py-10 sm:px-6">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border-2 border-ink bg-ink text-white shadow-[10px_10px_0_var(--color-teal)]">
        <div className="bg-grid-dark absolute inset-0 opacity-50" />
        <div className="absolute -right-32 bottom-0 size-[26rem] rounded-full bg-teal/25 blur-[100px]" />
        <div className="relative grid gap-12 p-7 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">For employers</p>
            <h2 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
              Need manpower?
              <br />
              We&apos;ll <span className="accent text-sun">fill the floor.</span>
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/70">
              Scaling a call-centre floor or hiring one critical role — KelasaHub sources, screens and delivers audited
              candidates, fast. Share a few details and get a tailored quotation.
            </p>
            <ul className="mt-7 space-y-3 text-[15px] text-white/85">
              {["Pre-screened shortlists in days, not weeks", "Language & shift-matched candidates", "First-month follow-up to cut early attrition"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-teal">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            {partners.length > 0 && (
              <div className="mt-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Companies hiring through us</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {partners.map((n, i) => (
                    <span
                      key={n}
                      className={`rounded-full border-[1.5px] px-3.5 py-1.5 font-display text-sm font-semibold ${
                        i % 3 === 0 ? "border-sun text-sun" : "border-white/25 text-white/85"
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto flex flex-wrap gap-2.5 pt-10">
              <a href={`tel:${SITE.phoneTel}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/20">
                <Phone className="size-4" /> {SITE.phoneDisplay}
              </a>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/20">
                <Mail className="size-4" /> {SITE.email}
              </a>
              <a
                href={whatsappLink("Hi, my business needs manpower support — could you share a quotation?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/20"
              >
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="self-start rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur sm:p-8">
            {done ? (
              <div className="flex h-full animate-pop flex-col items-center justify-center py-10 text-center">
                <span className="grid size-16 place-items-center rounded-full bg-teal">
                  <Check className="size-8" strokeWidth={3} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold">Request received!</h3>
                <p className="mt-2 max-w-xs text-white/70">Our team will reach out with a quotation shortly.</p>
                <button onClick={() => setDone(false)} className="mt-6 text-sm font-semibold text-sun underline-offset-4 hover:underline">
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="relative space-y-3.5" noValidate>
                <h3 className="font-display text-2xl font-semibold">Request a quotation</h3>
                <p className="-mt-1 pb-2 text-sm text-white/60">Takes 30 seconds. We reply within one working day.</p>
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" value={f.website} onChange={set("website")} />
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <input className={input} placeholder="Your name" value={f.name} onChange={set("name")} aria-label="Your name" />
                  <input className={input} placeholder="Designation" value={f.designation} onChange={set("designation")} aria-label="Designation" />
                </div>
                <input className={input} placeholder="Company name" value={f.company} onChange={set("company")} aria-label="Company name" />
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <input className={input} placeholder="Phone (optional)" inputMode="tel" value={f.phone} onChange={set("phone")} aria-label="Phone" />
                  <input className={input} placeholder="Headcount needed" value={f.headcount} onChange={set("headcount")} aria-label="Headcount needed" />
                </div>
                <select className={`${input} [&>option]:text-ink`} value={f.businessType} onChange={set("businessType")} aria-label="Business type">
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                {error && <p className="rounded-xl bg-coral/20 px-4 py-2.5 text-sm text-white">{error}</p>}
                <button
                  disabled={busy}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-sun px-6 py-3.5 text-[15px] font-bold text-ink shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Get my quotation
                  {!busy && <ArrowRight className="size-4 transition group-hover:translate-x-1" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
