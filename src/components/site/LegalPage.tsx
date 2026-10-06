import type { ReactNode } from "react";
import Link from "next/link";

export type LegalSection = { id: string; title: string; body: ReactNode };

const POLICIES = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/zero-fee-policy", label: "Zero-Fee Policy" },
];

export function LegalPage({
  eyebrow,
  title,
  accent,
  intro,
  updated,
  current,
  sections,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro: ReactNode;
  updated: string;
  current: string;
  sections: LegalSection[];
}) {
  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <header className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-deep">
          <span className="h-px w-8 bg-teal-deep" /> {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
          {title} <span className="accent text-teal-deep">{accent}</span>
        </h1>
        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</div>
        <p className="mt-6 inline-flex rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
          Last updated · {updated}
        </p>
      </header>

      <div className="mx-auto mt-14 grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[15rem_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="On this page" className="rounded-3xl border-2 border-ink bg-white p-5 shadow-[5px_5px_0_var(--color-ink)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">On this page</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 rounded-lg px-2 py-1 text-ink/75 transition hover:bg-sun-soft hover:text-ink">
                    <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <nav aria-label="Other policies" className="mt-4 flex flex-wrap gap-2 lg:flex-col">
            {POLICIES.filter((p) => p.href !== current).map((p) => (
              <Link key={p.href} href={p.href} className="rounded-full border-[1.5px] border-ink/20 px-3.5 py-1.5 text-sm font-semibold transition hover:border-ink">
                {p.label} →
              </Link>
            ))}
          </nav>
        </aside>

        <div className="legal max-w-3xl">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 border-t-2 border-ink/10 pb-10 pt-8 first:border-t-0 first:pt-0">
              <h2>
                <span className="mr-3 font-mono text-base text-teal-deep">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
