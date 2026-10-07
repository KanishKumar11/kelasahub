import type { Metadata } from "next";
import { BadgeIndianRupee, MapPin, PhoneCall } from "lucide-react";
import { getActiveJobs } from "@/lib/queries";
import { HIRING_STATS, SITE } from "@/lib/constants";
import { PageHero } from "@/components/site/PageHero";
import { Openings } from "@/components/site/Openings";
import { TrackBand } from "@/components/site/Story";
import { JsonLd } from "@/components/site/JsonLd";
import { Reveal } from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

const k = (n: number) => `₹${Math.round(n / 1000)}K`;

export const metadata: Metadata = {
  title: "BPO & Call Centre Jobs in Bangalore",
  description: `${HIRING_STATS.openPositions} open BPO, telecaller, customer support and back-office jobs in Bangalore paying ${k(HIRING_STATS.payMin)}–${k(HIRING_STATS.payMax)} a month. Freshers welcome, zero placement fee — apply in two minutes.`,
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage() {
  const jobs = await getActiveJobs();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: jobs.map((j, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE.url}/jobs/${j.slug}`, name: j.title })),
        }}
      />
      <PageHero
        crumbs={[{ label: "Jobs", href: "/jobs" }]}
        eyebrow={`${HIRING_STATS.openPositions} openings · ${jobs.length} job types`}
        title={
          <>
            BPO &amp; call centre jobs in <span className="accent text-teal-deep">Bangalore.</span>
          </>
        }
        lead={`Verified, salaried roles paying ${k(HIRING_STATS.payMin)}–${k(HIRING_STATS.payMax)} a month — voice, sales, support and back office. Freshers welcome, and you never pay a rupee.`}
      />
      <Openings
        jobs={jobs}
        intro={<p key="intro" className="max-w-md text-lg text-muted">Filter by what matters to you, then tap a role to see the details or apply in two minutes.</p>}
      />

      <section className="pb-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3">
          {[
            { icon: BadgeIndianRupee, title: "₹0, always", body: "Employers pay us. You never pay a registration, processing or joining fee." },
            { icon: PhoneCall, title: `Call back ${HIRING_STATS.callback}`, body: "A quick screening call, then interviews only for roles that fit you." },
            { icon: MapPin, title: "Walk-ins welcome", body: "Prefer to talk in person? Visit our office in Ramamurthy Nagar." },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="h-full rounded-[1.75rem] border-2 border-ink bg-white p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-teal-soft text-teal-deep">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <TrackBand />
      <div className="h-14" />
    </>
  );
}
