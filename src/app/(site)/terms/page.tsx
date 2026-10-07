import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { OFFICE, SITE } from "@/lib/constants";
import { POLICY_UPDATED } from "@/lib/policies";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms of Use",
  description: "The terms for using KelasaHub's website and recruitment services.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Accepting these terms",
    body: (
      <p>
        By using kelasahub.in, applying for a job, joining our talent pool or requesting a
        quotation, you agree to these Terms of Use and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
        please do not use our services.
      </p>
    ),
  },
  {
    id: "service",
    title: "What KelasaHub does",
    body: (
      <>
        <p>
          KelasaHub is a recruitment consultancy. We list openings from hiring partners, screen candidates, share suitable
          profiles with employers, coordinate interviews and follow up after joining.
        </p>
        <p>
          <strong>We are not the employer.</strong> Hiring decisions, offer letters, salaries, incentives, shift timings,
          work location and employment terms are set by the hiring company. Job details on our website are provided by
          our partners and may change; the employer&apos;s offer letter is what counts.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    title: "Free for candidates",
    body: (
      <p>
        Our services are free for job seekers. We never charge registration, processing, training, uniform or placement
        fees. Our <Link href="/zero-fee-policy">Zero-Fee Policy</Link> explains this in detail and how to report anyone who
        asks for money in our name.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    body: <p>You must be at least 18 years old and legally allowed to work in India to apply through KelasaHub.</p>,
  },
  {
    id: "your-responsibilities",
    title: "Your responsibilities",
    body: (
      <>
        <p>When you apply or contact us, you agree to:</p>
        <ul>
          <li>Give true, complete and current information about yourself, your education and your experience</li>
          <li>Apply only for yourself, using your own phone number and email address</li>
          <li>Attend interviews you confirm, or tell us in advance if you cannot</li>
          <li>Keep your Candidate ID and verification codes private</li>
        </ul>
        <p>
          We may reject or remove applications that contain false information, and we may stop working with candidates who
          repeatedly miss confirmed interviews or misuse our services.
        </p>
      </>
    ),
  },
  {
    id: "no-guarantee",
    title: "No guarantee of a job",
    body: (
      <p>
        We work hard to place every candidate, but we cannot guarantee an interview, selection, a particular salary or
        continued employment. Statements such as “call back within a day” describe our usual service and are not
        promises for every case.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>You must not:</p>
        <ul>
          <li>Submit spam, automated or fake applications, or another person&apos;s details</li>
          <li>Try to access other candidates&apos; data or our admin systems</li>
          <li>Interfere with the website, overload it, or bypass its security or rate limits</li>
          <li>Copy our job listings or content for commercial use without permission</li>
          <li>Pretend to be KelasaHub or our staff</li>
        </ul>
      </>
    ),
  },
  {
    id: "employers",
    title: "For employers",
    body: (
      <p>
        Quotation requests are not binding. Recruitment services for businesses are provided under a separate written
        agreement or quotation that sets out scope, fees and replacement terms. Candidate information we share with you
        must be used only for recruitment and handled in line with applicable data protection law.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Content and trademarks",
    body: (
      <p>
        The KelasaHub name, logo, website design and content belong to KelasaHub or its licensors. Company names of our
        hiring partners belong to their respective owners and are used only to describe openings.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        The website is provided “as is”. To the extent allowed by law, KelasaHub is not liable for indirect or
        consequential losses, for decisions or conduct of employers, or for losses caused by third parties who misuse our
        name. Nothing in these terms limits liability that cannot be limited under Indian law.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction over any
        dispute, subject to any rights you have under consumer protection law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        We may update these terms from time to time; the “Last updated” date shows the current version. Questions? Email{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, call <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a> or
        visit us at {OFFICE.address}.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of"
      accent="Use."
      intro={<p>The ground rules for using KelasaHub — written plainly, because a job search is stressful enough.</p>}
      updated={POLICY_UPDATED}
      current="/terms"
      sections={sections}
    />
  );
}
