import type { Metadata } from "next";
import { ArrowDown, ClipboardList, Handshake, PhoneCall, UserRoundSearch } from "lucide-react";
import { getSitePartners } from "@/lib/queries";
import { HIRING_STATS, OFFICE, SITE, whatsappLink } from "@/lib/constants";
import { PageHero } from "@/components/site/PageHero";
import { Business } from "@/components/site/Business";
import { EMPLOYER_FAQS, FaqList, faqLd } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/BrandIcons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hire BPO & Call Centre Staff in Bangalore",
  description:
    "Recruitment partner for Bangalore BPOs and call centres. Pre-screened telecallers, customer support, sales and back-office candidates — shortlists in days. Request a quotation.",
  alternates: { canonical: "/employers" },
};

const STEPS = [
  { icon: ClipboardList, title: "Share the requirement", body: "Role, headcount, shift, languages and salary band — a 30-second form or one WhatsApp message." },
  { icon: UserRoundSearch, title: "We source & screen", body: "Every candidate gets a screening call for communication, languages, shift fit and salary expectations." },
  { icon: PhoneCall, title: "You interview shortlists", body: "Only matched, interested candidates reach your floor. We schedule and remind them so they show up." },
  { icon: Handshake, title: "We follow through", body: "Day-one, week-one and month-one check-ins with every joiner to cut early attrition." },
];

const ROLES = [
  "Telecallers",
  "Customer support — voice",
  "Chat & email support",
  "Inside sales",
  "Collections",
  "Technical support",
  "Back office",
  "HR recruiters",
  "Quality analysts",
  "Team leaders",
  "Kannada / Tamil / Telugu / Malayalam voice",
  "French & Spanish language advisors",
];

export default async function EmployersPage() {
  const partners = await getSitePartners().catch(() => []);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Recruitment and staffing for BPO and call centres",
          areaServed: { "@type": "City", name: "Bengaluru" },
          provider: { "@type": "EmploymentAgency", name: SITE.name, url: SITE.url, telephone: SITE.phoneTel, address: OFFICE.address },
        }}
      />
      <JsonLd data={faqLd(EMPLOYER_FAQS)} />
      <PageHero
        crumbs={[{ label: "For employers", href: "/employers" }]}
        eyebrow="For employers"
        tone="sun"
        title={
          <>
            Hire BPO &amp; call-centre staff in <span className="accent text-teal-deep">Bangalore.</span>
          </>
        }
        lead="KelasaHub sources, screens and delivers audited candidates for voice, sales, support and back-office teams — whether you're filling one critical seat or a whole floor."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#business" className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-sun px-6 py-3.5 text-sm font-bold text-ink">
            Request a quotation <ArrowDown className="size-4" />
          </a>
          <a
            href={whatsappLink("Hi, my business needs manpower support — could you share a quotation?")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-6 py-3.5 text-sm font-bold"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp us
          </a>
        </div>
      </PageHero>

      {/* Proof */}
      <section className="border-y-2 border-ink bg-white">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 px-4 sm:px-6 lg:grid-cols-4">
          {[
            { value: `${HIRING_STATS.placed}+`, label: `Candidates placed in ${HIRING_STATS.placedPeriod}` },
            { value: String(HIRING_STATS.partners), label: "Hiring partners" },
            { value: String(HIRING_STATS.openPositions), label: "Roles we're filling now" },
            { value: "1 day", label: "To reply to your request" },
          ].map((s) => (
            <div key={s.label} className="px-1 py-8 sm:py-10">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{s.value}</dd>
              <dd className="mt-1 text-sm font-medium text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Process */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
              How we <span className="accent text-teal-deep">hire for you.</span>
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 70} as="li" className="flex h-full flex-col rounded-[1.75rem] border-2 border-ink bg-white p-6 transition hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-sun">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-sm font-bold text-ink/35">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section className="border-y-2 border-ink bg-paper-2 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl">
              Roles we <span className="accent text-teal-deep">fill.</span>
            </h2>
            <p className="mt-4 max-w-sm text-muted">Freshers to team leads, in English, Hindi, every South Indian language and more.</p>
          </Reveal>
          <Reveal delay={80} className="flex flex-wrap gap-2.5">
            {ROLES.map((r, i) => (
              <span
                key={r}
                className={`rounded-full border-2 border-ink px-4 py-2 text-sm font-bold ${i % 5 === 0 ? "bg-sun" : i % 5 === 3 ? "bg-teal text-white" : "bg-white"}`}
              >
                {r}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="pt-14">
        <Business partners={partners} />
      </div>

      {/* Employer FAQ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl">
              Employer <span className="accent text-teal-deep">questions.</span>
            </h2>
            <p className="mt-4 max-w-sm text-muted">
              Anything else? Call{" "}
              <a href={`tel:${SITE.phoneTel}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                {SITE.phoneDisplay}
              </a>
              .
            </p>
          </Reveal>
          <FaqList items={EMPLOYER_FAQS} name="employer-faq" />
        </div>
      </section>
    </>
  );
}
