import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Lightbulb } from "lucide-react";
import { RESUME_EXAMPLES, exampleBySlug } from "@/lib/resume-examples";
import { PageHero } from "@/components/site/PageHero";
import { ResumePreview } from "@/components/site/ResumePreview";
import { ResumeExamples } from "@/components/site/ResumeExamples";

export function generateStaticParams() {
  return RESUME_EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/resume-builder/[slug]">): Promise<Metadata> {
  const ex = exampleBySlug((await props.params).slug);
  if (!ex) return {};
  return {
    title: `${ex.searchTitle} (Free PDF)`,
    description: `${ex.intro} Edit this ${ex.role.toLowerCase()} resume example online and download it as a PDF — free.`.slice(0, 160),
    alternates: { canonical: `/resume-builder/${ex.slug}` },
  };
}

export default async function ResumeExamplePage(props: PageProps<"/resume-builder/[slug]">) {
  const ex = exampleBySlug((await props.params).slug);
  if (!ex) notFound();
  const use = `/resume-builder?example=${ex.slug}`;

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Resume builder", href: "/resume-builder" },
          { label: `${ex.role} resume`, href: `/resume-builder/${ex.slug}` },
        ]}
        eyebrow="Free resume example"
        tone="sun"
        title={
          <>
            {ex.role} resume <span className="accent text-teal-deep">example.</span>
          </>
        }
        lead={ex.intro}
      >
        <Link href={use} className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3.5 text-sm font-bold text-ink">
          Use this example — it&apos;s free <ArrowRight className="size-4" />
        </Link>
      </PageHero>

      <section className="pb-8">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
              <Lightbulb className="size-6 text-teal-deep" /> What makes it work
            </h2>
            <ul className="mt-5 space-y-3">
              {ex.tips.map((t) => (
                <li key={t} className="flex gap-3 rounded-2xl border-2 border-ink bg-white p-4 text-[15px] leading-relaxed">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-[1.75rem] bg-ink p-6 text-white">
              <p className="font-display text-xl font-bold">Make it yours in 10 minutes</p>
              <p className="mt-1 text-sm text-white/70">
                Open it in the builder, replace the sample details with your own, and download a clean, ATS-friendly PDF. No sign-up needed.
              </p>
              <Link href={use} className="btn-pop mt-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-5 py-3 text-sm font-bold text-ink">
                Edit this resume <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div>
            <ResumePreview r={ex.resume} />
            <p className="mt-3 text-center text-xs text-muted">Sample resume — the person and companies are fictional.</p>
          </div>
        </div>
      </section>

      <ResumeExamples exclude={ex.slug} title="More resume examples" />
    </>
  );
}
