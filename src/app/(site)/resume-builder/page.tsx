import type { Metadata } from "next";
import { getCandidateSession } from "@/lib/candidate-auth";
import { draftFromApplication, getSavedResume } from "@/lib/resume-store";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE } from "@/lib/constants";
import { BuilderLoader } from "./BuilderLoader";
import { ResumeExamples } from "@/components/site/ResumeExamples";
import { exampleBySlug } from "@/lib/resume-examples";
import { getActiveJobs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Free Resume Builder for BPO & Call Centre Jobs",
  description:
    "Make a professional resume in minutes — free, no sign-up needed. Ready-made lines for telecaller, customer support and sales roles. Download as PDF.",
  alternates: { canonical: "/resume-builder" },
};

export default async function ResumeBuilderPage(props: PageProps<"/resume-builder">) {
  const sp = await props.searchParams;
  const ex = typeof sp.example === "string" ? exampleBySlug(sp.example) : null;
  const [session, jobs] = await Promise.all([getCandidateSession(), getActiveJobs().catch(() => [])]);
  let initial = null;
  if (session) {
    const saved = await getSavedResume(session.email);
    initial = saved ? { data: saved.data, saved: true } : { data: await draftFromApplication(session.email), saved: false };
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "KelasaHub Free Resume Builder",
          url: `${SITE.url}/resume-builder`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }}
      />
      <PageHero
        crumbs={[{ label: "Resume builder", href: "/resume-builder" }]}
        eyebrow="Free · no sign-up needed"
        tone="sun"
        title={
          <>
            A resume that gets you <span className="accent text-teal-deep">the call.</span>
          </>
        }
        lead="Fill in the blanks, tap our ready-made lines for BPO and call-centre roles, and download a clean PDF. Free for every job seeker — always."
      />
      <BuilderLoader
        signedIn={!!session}
        initial={initial}
        example={ex ? { slug: ex.slug, role: ex.role, resume: ex.resume } : null}
        jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
      />
      <ResumeExamples />
    </>
  );
}
