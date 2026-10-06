import { Hero } from "@/components/site/Hero";
import { Openings } from "@/components/site/Openings";
import { HowItWorks, Languages, OurPromise, Testimonials, TrackBand } from "@/components/site/Story";
import { Faq } from "@/components/site/Faq";
import { Business } from "@/components/site/Business";
import { Visit } from "@/components/site/Visit";
import { JsonLd } from "@/components/site/JsonLd";
import { getActiveJobs, getSitePartners } from "@/lib/queries";
import { jobPostingLd, organizationLd } from "@/lib/jsonld";
import { HIRING_STATS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jobs, partners] = await Promise.all([getActiveJobs(), getSitePartners()]);

  const k = (n: number) => `₹${Math.round(n / 1000)}K`;
  const stats = [
    { value: String(HIRING_STATS.openPositions), label: "Roles hiring now" },
    { value: `${k(HIRING_STATS.payMin)}–${k(HIRING_STATS.payMax)}`, label: "Monthly pay" },
    { value: String(HIRING_STATS.partners), label: "Hiring partners" },
    { value: "1 day", label: "To call back" },
  ];

  return (
    <>
      <JsonLd data={organizationLd()} />
      {jobs.map((j) => (
        <JsonLd key={j.id} data={jobPostingLd(j)} />
      ))}
      <Hero partners={partners} stats={stats} />
      <Openings jobs={jobs} />
      <HowItWorks />
      <OurPromise />
      <Languages />
      <Testimonials />
      <TrackBand />
      <Faq />
      <Business partners={partners} />
      <Visit />
    </>
  );
}
