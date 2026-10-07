import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Reveal } from "./Reveal";

type QA = { q: string; a: string };

export const FAQS: QA[] = [
  {
    q: "Do I really pay nothing, ever?",
    a: "Yes. KelasaHub is paid by the hiring companies, never by candidates — no registration fee, no “processing charge”, no exceptions.",
  },
  {
    q: "How fast will I actually hear back?",
    a: "We call you back within a day of applying for a quick screening. You can track every stage with your Candidate ID.",
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
  {
    q: "I'm a fresher. Can I still get a call-centre job?",
    a: "Yes. Many of our voice, sales and back-office roles welcome freshers — clear communication and the right attitude matter more than experience. Look for the “Freshers OK” tag on an opening.",
  },
  {
    q: "Which languages help me get hired?",
    a: "English plus any South Indian language — Kannada, Tamil, Telugu or Malayalam — opens the most doors. Hindi helps too, and French or Spanish speakers can qualify for international roles with much higher pay.",
  },
  {
    q: "How do I check my application status?",
    a: "Go to the Track application page, enter your Candidate ID and the email you applied with, and we'll email you a one-time code to see where you stand. You can download your application form there too.",
  },
  {
    q: "What should I bring to the interview?",
    a: "Usually a government photo ID, your education certificates and a couple of passport photos. We'll confirm exactly what that employer needs when we schedule your interview.",
  },
];

export const EMPLOYER_FAQS: QA[] = [
  {
    q: "What roles can KelasaHub hire for?",
    a: "Voice and non-voice BPO roles, telecallers, customer support, sales and collections, back office, HR recruiters and QA — plus language-specific roles for South Indian and international languages.",
  },
  {
    q: "How quickly can you share candidates?",
    a: "For most volume roles we share pre-screened shortlists within days. Tell us the headcount, shift and languages you need and we'll give you a realistic timeline.",
  },
  {
    q: "How are candidates screened?",
    a: "Every candidate has a screening call covering communication, languages, shift availability and salary expectations before they reach you — so your team interviews fewer, better-matched people.",
  },
];

export function faqLd(items: QA[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function FaqList({ items, name = "faq" }: { items: QA[]; name?: string }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <Reveal key={f.q} delay={Math.min(i, 6) * 50}>
          <details className="group rounded-2xl border-2 border-ink bg-white px-6 transition open:bg-sun-soft open:shadow-[5px_5px_0_var(--color-ink)]" name={name}>
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
  );
}

/** Home-page FAQ teaser: the first few questions and a link to the full /faq page. */
export function Faq({ limit = 5 }: { limit?: number }) {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep"><span className="h-px w-8 bg-teal-deep" /> Before you apply</p>
          <h2 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
            Questions, <span className="accent text-teal-deep">answered.</span>
          </h2>
          <p className="mt-4 max-w-sm text-muted">Something else on your mind? WhatsApp us — a real person replies.</p>
          <Link href="/faq" className="btn-pop mt-7 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-5 py-3 text-sm font-bold">
            All {FAQS.length + EMPLOYER_FAQS.length} questions <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <FaqList items={FAQS.slice(0, limit)} />
      </div>
    </section>
  );
}
