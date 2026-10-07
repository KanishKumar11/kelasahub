import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { PageHero } from "@/components/site/PageHero";
import { EMPLOYER_FAQS, FAQS, FaqList, faqLd } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { WhatsAppIcon } from "@/components/site/BrandIcons";

export const metadata: Metadata = {
  title: "FAQs — Fees, Freshers, Interviews & Status",
  description:
    "Answers to common questions about KelasaHub: zero placement fees, jobs for freshers, languages, interviews, tracking your application, and hiring staff.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqLd([...FAQS, ...EMPLOYER_FAQS])} />
      <PageHero
        crumbs={[{ label: "FAQs", href: "/faq" }]}
        eyebrow="Help centre"
        title={
          <>
            Questions, <span className="accent text-teal-deep">answered.</span>
          </>
        }
        lead="Everything candidates and employers usually ask us. Can't find yours? WhatsApp us — a real person replies."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:sticky lg:top-28 lg:self-start">For job seekers</h2>
            <FaqList items={FAQS} name="faq-candidates" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">For employers</h2>
              <Link href="/employers" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-teal-deep hover:underline">
                Hiring with KelasaHub <ArrowRight className="size-4" />
              </Link>
            </div>
            <FaqList items={EMPLOYER_FAQS} name="faq-employers" />
          </div>
          <div className="flex flex-col items-start gap-5 rounded-[2rem] border-2 border-ink bg-sun p-8 shadow-[8px_8px_0_var(--color-ink)] sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <p className="font-display text-3xl font-bold leading-tight tracking-tight">
              Still <span className="accent">wondering?</span>
            </p>
            <a
              href={whatsappLink("Hi KelasaHub, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-2"
            >
              <WhatsAppIcon className="size-4 text-[#25D366]" /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
