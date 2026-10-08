import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase, Building2, Check, Clock, IndianRupee, MapPin } from "lucide-react";
import { getActiveJobs, getJobBySlug } from "@/lib/queries";
import { jobPostingLd } from "@/lib/jsonld";
import { SHIFT_TIMINGS, SITE, whatsappLink } from "@/lib/constants";
import { JsonLd } from "@/components/site/JsonLd";
import { ApplyButton } from "@/components/site/ApplyButton";
import { WhatsAppIcon } from "@/components/site/BrandIcons";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  return {
    title: `${job.title} — ${job.salary}`,
    description: `${job.description} ${job.requirements}`.slice(0, 160),
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: job.image ? { images: [job.image] } : undefined,
  };
}

export default async function JobPage(props: PageProps<"/jobs/[slug]">) {
  const { slug } = await props.params;
  const jobs = await getActiveJobs();
  const job = jobs.find((j) => j.slug === slug);
  if (!job) notFound();
  const others = jobs.filter((j) => j.id !== job.id).slice(0, 3);
  const company = job.company ? `${job.company} · ${job.location}` : job.location;
  const reqs = job.requirements.split(/(?<=[.;])\s+/).map((r) => r.replace(/[.;]$/, "")).filter(Boolean);

  return (
    <>
      <JsonLd data={jobPostingLd(job)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Jobs", item: `${SITE.url}/jobs` },
            { "@type": "ListItem", position: 3, name: job.title, item: `${SITE.url}/jobs/${job.slug}` },
          ],
        }}
      />
      <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute -right-32 -top-24 -z-10 size-[30rem] rounded-full bg-teal/20 blur-[110px]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink">
            <ArrowLeft className="size-4" /> All openings
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div className="animate-rise">
              <div className="flex flex-wrap gap-2">
                {job.freshersOk && <span className="rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal-deep">Freshers welcome</span>}
                <span className="rounded-full bg-sun-soft px-3 py-1 text-xs font-semibold">₹0 placement fee</span>
              </div>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[1] tracking-tight sm:text-6xl">{job.title}</h1>
              <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: IndianRupee, label: "Salary", value: job.salary },
                  { icon: MapPin, label: "Location", value: job.location },
                  { icon: Building2, label: "Company", value: job.company || "KelasaHub partner" },
                  { icon: Briefcase, label: "Job type", value: job.workModeLabel },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl border border-line bg-white p-4">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon className="size-3.5" /> {label}
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-semibold leading-snug">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-semibold">About the role</h2>
                  <p className="mt-3 text-[17px] leading-relaxed text-ink/80">{job.description}</p>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">What you&apos;ll need</h2>
                  <ul className="mt-4 space-y-3">
                    {reqs.map((r) => (
                      <li key={r} className="flex gap-3 text-[16px] leading-relaxed text-ink/80">
                        <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-teal text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <Clock className="size-5 text-teal-deep" /> {job.shiftTiming ? "Shift timing" : "Shift options"}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(job.shiftTiming ? [job.shiftTiming] : SHIFT_TIMINGS).map((s) => (
                      <span key={s} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium">
                        {s}
                      </span>
                    ))}
                    {job.shifts != null && (
                      <span className="rounded-full bg-teal-soft px-4 py-2 text-sm font-semibold text-teal-deep">
                        {job.shifts} {job.shifts === 1 ? "shift" : "shifts"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ApplyButton role={job.title} jobId={job.id} company={company} />
                <a
                  href={whatsappLink(`Hi KelasaHub, I'm interested in the ${job.title} role.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-white px-7 py-4 text-[15px] font-semibold transition hover:border-ink/30"
                >
                  <WhatsAppIcon className="size-5 text-[#25D366]" /> Ask on WhatsApp
                </a>
              </div>
            </div>

            <aside className="animate-rise space-y-4 [animation-delay:120ms] lg:sticky lg:top-28 lg:self-start">
              {job.image && (
                <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_30px_60px_-30px_rgba(11,31,58,0.45)]">
                  <Image src={job.image} alt={`${job.title} hiring poster`} width={900} height={900} className="h-auto w-full" priority />
                </div>
              )}
              <Link
                href="/resume-builder"
                className="group flex items-center justify-between gap-4 rounded-[1.5rem] border-2 border-ink bg-sun-soft p-5 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)]"
              >
                <span>
                  <span className="block font-display text-lg font-bold">No resume? Make one free</span>
                  <span className="text-sm text-muted">10 minutes, ready-made lines for this kind of role</span>
                </span>
                <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-1" />
              </Link>
            </aside>
          </div>

          {others.length > 0 && (
            <div className="mt-24">
              <h2 className="font-display text-3xl font-bold tracking-tight">Other openings</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {others.map((o) => (
                  <Link
                    key={o.id}
                    href={`/jobs/${o.slug}`}
                    className="group rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:border-teal/50"
                  >
                    <p className="font-display text-xl font-semibold group-hover:text-teal-deep">{o.title}</p>
                    <p className="mt-1.5 text-sm font-semibold text-teal-deep">{o.salary}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{o.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
