import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RESUME_EXAMPLES } from "@/lib/resume-examples";
import { Reveal } from "./Reveal";

/** Grid of role-specific resume examples, each linking to its own page. */
export function ResumeExamples({ exclude, title = "Start from an example" }: { exclude?: string; title?: string }) {
  const list = RESUME_EXAMPLES.filter((e) => e.slug !== exclude);
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-xl text-muted">Real-world formats for Bangalore&apos;s most-hired call-centre roles. Open one, swap in your details, download.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => (
            <Reveal key={e.slug} delay={i * 50}>
              <Link
                href={`/resume-builder/${e.slug}`}
                className="group flex h-full items-start justify-between gap-4 rounded-[1.5rem] border-2 border-ink bg-white p-5 transition hover:-translate-y-1 hover:bg-sun-soft hover:shadow-[5px_5px_0_var(--color-ink)]"
              >
                <span>
                  <span className="block font-display text-xl font-bold">{e.role} resume</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-muted">{e.intro}</span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 transition group-hover:rotate-45" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
