import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HIRING_STATS } from "@/lib/constants";
import { PageHero } from "@/components/site/PageHero";
import { HowItWorks, Languages, OurPromise, Testimonials } from "@/components/site/Story";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "About KelasaHub — Free Job Placements in Bangalore",
  description: `KelasaHub is a Bangalore job consultancy that places candidates in verified roles across industries for free. ${HIRING_STATS.placed}+ candidates placed in ${HIRING_STATS.placedPeriod}, with ${HIRING_STATS.partners} hiring partners.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "About", href: "/about" }]}
        eyebrow="About KelasaHub"
        title={
          <>
            Good jobs, <span className="accent text-teal-deep">free</span> for every candidate.
          </>
        }
        lead={
          <>
            <span className="font-kannada font-bold text-ink">ಕೆಲಸ</span> (kelasa) means <em>work</em> in Kannada. KelasaHub connects Bangalore job
            seekers with verified jobs across industries — and the hiring companies pay us, so candidates never pay a rupee.
          </>
        }
      />

      <section className="pb-6">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3">
          {[
            { value: `${HIRING_STATS.placed}+`, label: `candidates placed in ${HIRING_STATS.placedPeriod}`, tone: "bg-sun" },
            { value: String(HIRING_STATS.partners), label: "hiring partners across Bangalore", tone: "bg-white" },
            { value: "₹0", label: "charged to a candidate, ever", tone: "bg-teal text-white" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div className={`h-full rounded-[1.75rem] border-2 border-ink p-7 ${s.tone}`}>
                <p className="font-display text-6xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-2 text-[15px] font-semibold opacity-80">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <OurPromise />
      <HowItWorks />
      <Languages />
      <Testimonials />

      <section className="pb-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:px-6">
          <Link href="/jobs" className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3.5 text-sm font-bold text-ink">
            See open jobs <ArrowRight className="size-4" />
          </Link>
          <Link href="/contact" className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-6 py-3.5 text-sm font-bold">
            Visit our office
          </Link>
        </div>
      </section>
    </>
  );
}
