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
import { SignInPanel } from "../account/AccountClient";

export const metadata: Metadata = {
  title: "Free Resume Builder for BPO & Call Centre Jobs",
  description:
    "Make a professional resume in minutes — free with a quick email sign-in. Ready-made lines for telecaller, customer support and sales roles. Download as PDF.",
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
        eyebrow="Free · sign in with your email"
        tone="sun"
        title={
          <>
            A resume that gets you <span className="accent text-teal-deep">the call.</span>
          </>
        }
        lead="Fill in the blanks, tap our ready-made lines for BPO and call-centre roles, and download a clean PDF. Free for every job seeker — always."
      />
      {session ? (
        <BuilderLoader
          signedIn
          initial={initial}
          example={ex ? { slug: ex.slug, role: ex.role, resume: ex.resume } : null}
          jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
        />
      ) : (
        <section className="pb-24">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            <div className="rounded-[2rem] border-2 border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-8">
              <h2 className="font-display text-2xl font-bold">Sign in to start your resume</h2>
              <p className="mb-5 mt-1 text-sm text-muted">No password needed — we&apos;ll email you a code. Your resume is saved to your account.</p>
              <SignInPanel />
            </div>
          </div>
        </section>
      )}
      <ResumeExamples />
    </>
  );
}
