import { BadgeCheck, CalendarCheck, Check, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { TrackForm } from "./TrackForm";
import { Manifesto } from "./Manifesto";
import { QuoteRotator } from "./QuoteRotator";

/* ------------------------------ How it works ------------------------------ */
// Cards stick and stack as you scroll (pure CSS sticky positioning).

const STEPS = [
  {
    n: "01",
    title: "Apply in two minutes",
    body: "Three short steps or a WhatsApp message. Tell us your languages, shift and salary once — no resume needed.",
    tone: "bg-paper text-ink",
    visual: "apply",
  },
  {
    n: "02",
    title: "Get audited once",
    body: "A quick screening call checks fit, so employers see you as pre-vetted. You interview less and hear back faster.",
    tone: "bg-teal text-white",
    visual: "audit",
  },
  {
    n: "03",
    title: "Get placed",
    body: "Interview, get selected and see your joining date. Track every step with your Candidate ID.",
    tone: "bg-sun text-ink",
    visual: "offer",
  },
  {
    n: "04",
    title: "We still show up",
    body: "We check in on day one, week one and month one — because your success is how we prove ourselves.",
    tone: "bg-white text-ink",
    visual: "followup",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 bg-ink py-24 text-white sm:py-32">
      <div className="bg-grid-dark absolute inset-0 [mask-image:linear-gradient(#000,transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-sun">
            <span className="h-px w-8 bg-sun" /> How it works
          </p>
          <h2 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
            Four steps. <span className="accent text-sun">No</span> waiting rooms.
          </h2>
        </Reveal>

        <ol className="mt-16">
          {STEPS.map((s, i) => (
            <li key={s.n} className="sticky mb-6 last:mb-0" style={{ top: `${6 + i * 1.75}rem` }}>
              <div
                className={`grid min-h-[22rem] gap-8 rounded-[2.5rem] border-2 border-ink p-7 shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.6)] sm:p-10 md:grid-cols-[1.1fr_1fr] md:items-center ${s.tone}`}
              >
                <div>
                  <span className="font-display text-7xl font-bold leading-none tracking-tighter opacity-25 sm:text-8xl">{s.n}</span>
                  <h3 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">{s.title}</h3>
                  <p className="mt-3 max-w-md text-[17px] leading-relaxed opacity-80">{s.body}</p>
                </div>
                <StepVisual kind={s.visual} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepVisual({ kind }: { kind: (typeof STEPS)[number]["visual"] }) {
  const card = "mx-auto w-full max-w-sm rounded-3xl border-2 border-ink bg-white p-5 text-ink shadow-[8px_8px_0_var(--color-ink)]";
  if (kind === "apply")
    return (
      <div className={`${card} -rotate-2`}>
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Step 1 of 3 · About you</p>
        <div className="mt-3 h-1.5 rounded-full bg-paper-2">
          <div className="h-full w-1/3 rounded-full bg-sun" />
        </div>
        {["Priya N.", "98•••• 4321"].map((v) => (
          <div key={v} className="mt-3 flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm">
            {v} <Check className="size-4 text-teal" strokeWidth={3} />
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Kannada", "Hindi", "Day shift"].map((t) => (
            <span key={t} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  if (kind === "audit")
    return (
      <div className={`${card} rotate-2`}>
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <BadgeCheck className="size-5 text-teal" /> Screening complete
        </p>
        <ul className="mt-3 space-y-2">
          {["Communication", "Languages", "Shift fit", "Salary fit"].map((t) => (
            <li key={t} className="flex items-center justify-between rounded-xl bg-teal-soft px-3 py-2 text-sm font-semibold text-teal-deep">
              {t}
              <span className="grid size-5 place-items-center rounded-full bg-teal text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  if (kind === "offer")
    return (
      <div className={`${card} -rotate-1`}>
        <span className="sticker rotate-[-4deg] bg-teal text-[11px] text-white">SELECTED ✓</span>
        <p className="mt-4 font-display text-2xl font-bold">Joining Monday, 10 AM</p>
        <p className="mt-1 text-sm text-muted">Telecaller · Nex-Gen, HBR Layout</p>
        <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-line pt-3 text-sm">
          <span className="text-muted">Fee you pay</span>
          <span className="font-display text-xl font-bold text-teal-deep">₹0</span>
        </div>
      </div>
    );
  return (
    <div className={`${card} rotate-1`}>
      <p className="flex items-center gap-2 font-display text-lg font-bold">
        <CalendarCheck className="size-5 text-teal" /> Check-ins
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Day 1", true],
          ["Week 1", true],
          ["Month 1", false],
        ].map(([d, done]) => (
          <div key={d as string} className={`rounded-2xl border-2 p-3 ${done ? "border-ink bg-sun" : "border-dashed border-ink/30"}`}>
            <p className="text-xs font-bold">{d}</p>
            <p className="mt-1 text-lg">{done ? "✓" : "…"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Manifesto --------------------------------- */

export function OurPromise() {
  return (
    <section className="py-24 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">
          <span className="h-px w-8 bg-teal-deep" /> Our promise
        </p>
        <Manifesto />
        <div className="mt-14 flex flex-wrap gap-3">
          <span className="sticker -rotate-2 bg-sun">₹0 registration</span>
          <span className="sticker rotate-1 bg-white">₹0 processing</span>
          <span className="sticker -rotate-1 bg-teal text-white">₹0 after you join</span>
          <span className="sticker rotate-2 bg-ink text-white">Report anyone who asks</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Languages --------------------------------- */

const HELLOS = [
  { word: "ನಮಸ್ಕಾರ", lang: "Kannada", cls: "font-kannada", tone: "bg-sun" },
  { word: "नमस्ते", lang: "Hindi", cls: "", tone: "bg-white" },
  { word: "வணக்கம்", lang: "Tamil", cls: "", tone: "bg-teal text-white" },
  { word: "నమస్కారం", lang: "Telugu", cls: "", tone: "bg-white" },
  { word: "നമസ്കാരം", lang: "Malayalam", cls: "", tone: "bg-ink text-white" },
  { word: "Bonjour", lang: "French · ₹50K roles", cls: "accent", tone: "bg-[#fde3da]" },
  { word: "¡Hola!", lang: "Spanish · ₹50K roles", cls: "accent", tone: "bg-teal-soft" },
];

export function Languages() {
  return (
    <section className="overflow-hidden border-y-2 border-ink bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
            Your mother tongue is your <span className="accent text-teal-deep">superpower.</span>
          </h2>
          <p className="max-w-md text-lg text-muted lg:justify-self-end">
            Bangalore&apos;s call centres serve all of South India — and the world. Speaking one more language can mean
            the job, or a much bigger salary.
          </p>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {HELLOS.map((h, i) => (
            <Reveal key={h.lang} delay={i * 60} className={i === 0 ? "col-span-2 row-span-2 sm:col-span-1 lg:col-span-2" : ""}>
              <div
                className={`group flex h-full min-h-40 flex-col justify-between rounded-[2rem] border-2 border-ink p-6 transition duration-300 hover:-translate-y-1 hover:rotate-[-1.5deg] hover:shadow-[8px_8px_0_var(--color-ink)] ${h.tone}`}
              >
                <p className={`font-bold leading-none tracking-tight ${h.cls} ${i === 0 ? "text-6xl sm:text-7xl lg:text-8xl" : "text-3xl sm:text-4xl"}`}>
                  {h.word}
                </p>
                <p className="mt-6 flex items-center justify-between text-sm font-bold uppercase tracking-wider opacity-80">
                  {h.lang}
                  <Sparkles className="size-4 opacity-0 transition group-hover:opacity-100" />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Track band -------------------------------- */

export function TrackBand() {
  return (
    <section className="px-4 py-10 sm:px-6">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border-2 border-ink bg-sun px-6 py-12 shadow-[10px_10px_0_var(--color-ink)] sm:px-12 sm:py-14">
        <span
          aria-hidden
          className="text-outline pointer-events-none absolute -right-6 -top-10 select-none font-display text-[12rem] font-bold leading-none text-ink/15"
        >
          ?
        </span>
        <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
              Already <span className="accent">applied?</span>
            </h2>
            <p className="mt-3 max-w-md text-[17px] text-ink/75">
              No more “any update?” calls. Check where you stand with your Candidate ID — at 11 PM if you want.
            </p>
          </div>
          <TrackForm compact />
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

export function Testimonials() {
  return (
    <section id="reviews" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">
          <span className="h-px w-8 bg-teal-deep" /> From candidates
        </p>
        <QuoteRotator />
      </div>
    </section>
  );
}
