import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";

export const FAQS = [
  {
    q: "Do I really pay nothing, ever?",
    a: "Yes. KelasaHub is paid by the hiring companies, never by candidates — no registration fee, no “processing charge”, no exceptions.",
  },
  {
    q: "How fast will I actually hear back?",
    a: "Most candidates get an acknowledgment within 24 hours and a first screening call within 3–5 days. You can track every stage with your Candidate ID.",
  },
  {
    q: "What happens if I don't get selected?",
    a: "Your profile stays active. Many placements come from matching candidates to a second or third role after an initial “no” — being audited once means we don't need to re-screen you.",
  },
  {
    q: "Can I apply to more than one role?",
    a: "Yes — apply to each role you like, or join the talent pool once and we'll match you across openings.",
  },
  {
    q: "Do I need to upload a resume?",
    a: "Not to apply — your details are enough to get started. You can send a resume over WhatsApp afterwards if the employer asks for one.",
  },
  {
    q: "Can I walk in to your office?",
    a: "Absolutely. Visit our head office in Ramamurthy Nagar during working hours, or WhatsApp us first so we can keep your interview slot ready.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep"><span className="h-px w-8 bg-teal-deep" /> Before you apply</p>
          <h2 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
            Questions, <span className="accent text-teal-deep">answered.</span>
          </h2>
          <p className="mt-4 max-w-sm text-muted">Something else on your mind? WhatsApp us — a real person replies.</p>
        </Reveal>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <details className="group rounded-2xl border-2 border-ink bg-white px-6 transition open:bg-sun-soft open:shadow-[5px_5px_0_var(--color-ink)]" name="faq">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[17px] font-semibold">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper transition group-open:rotate-45 group-open:bg-ink group-open:text-white">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="-mt-1 pb-5 pr-10 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
