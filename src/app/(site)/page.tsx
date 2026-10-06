import { Hero } from "@/components/site/Hero";
import { Openings } from "@/components/site/Openings";
import { HowItWorks, Languages, OurPromise, Testimonials, TrackBand } from "@/components/site/Story";
import { Faq } from "@/components/site/Faq";
import { Business } from "@/components/site/Business";
import { Visit } from "@/components/site/Visit";
import { JsonLd } from "@/components/site/JsonLd";
import { getActiveJobs, getSitePartners } from "@/lib/queries";
import { jobPostingLd, organizationLd } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jobs, partners] = await Promise.all([getActiveJobs(), getSitePartners()]);

  const pays = jobs.map((j) => j.salaryMax).filter((n): n is number => !!n);
  const k = (n: number) => `₹${Math.round(n / 1000)}K`;
  const stats = [
    { value: "₹0", label: "Placement fee" },
    { value: pays.length ? `${k(Math.min(...pays))}–${k(Math.max(...pays))}` : "—", label: "Monthly pay" },
    { value: `${partners.length}+`, label: "Hiring partners" },
    { value: "3–5 days", label: "To first call" },
  ];

  return (
    <>
      <JsonLd data={organizationLd()} />
      {jobs.map((j) => (
        <JsonLd key={j.id} data={jobPostingLd(j)} />
      ))}
      <Hero jobs={jobs} stats={stats} />
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
