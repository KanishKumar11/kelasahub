import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { OFFICE, SITE, whatsappLink } from "@/lib/constants";
import { POLICY_UPDATED } from "@/lib/policies";

export const metadata: Metadata = {
  alternates: { canonical: "/zero-fee-policy" },
  title: "Zero-Fee Policy & Fraud Alert",
  description: "KelasaHub never charges candidates. Learn how to spot fake job offers and report anyone asking for money in our name.",
};

const sections: LegalSection[] = [
  {
    id: "promise",
    title: "Our promise",
    body: (
      <>
        <p>
          <strong>KelasaHub never charges job seekers — not before, during or after placement.</strong> We are paid by the
          companies that hire, never by candidates.
        </p>
        <div className="callout">
          <p>
            We will never ask you for: registration fees · processing fees · document verification fees · training or
            certification fees · uniform, laptop or ID-card deposits · “confirmation” or “joining” fees · a share of your
            salary.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "how-we-contact",
    title: "How we contact you",
    body: (
      <>
        <p>Genuine KelasaHub communication only comes from:</p>
        <ul>
          <li>
            Phone / WhatsApp: <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>
          </li>
          <li>
            Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or other addresses ending in <strong>@kelasahub.in</strong>
          </li>
          <li>
            Website: <strong>kelasahub.in</strong>
          </li>
          <li>Our office: {OFFICE.address}</li>
        </ul>
        <p>Interview and joining details are always confirmed by our team; you can check your status anytime with your Candidate ID.</p>
      </>
    ),
  },
  {
    id: "red-flags",
    title: "Signs of a fake job offer",
    body: (
      <ul>
        <li>Anyone asking you to pay money, scan a QR code or share a UPI PIN or OTP to “secure” a job</li>
        <li>An offer letter without an interview, or a salary far above what the role normally pays</li>
        <li>Messages from personal Gmail/Yahoo addresses or unknown numbers claiming to be KelasaHub</li>
        <li>Pressure to decide or pay “today only”</li>
        <li>Requests for your bank password, card details or OTPs</li>
      </ul>
    ),
  },
  {
    id: "if-asked",
    title: "If someone asks you to pay",
    body: (
      <>
        <ul>
          <li>Do not pay, and do not share any OTP, UPI PIN or bank details</li>
          <li>
            Report it to us on <a href={whatsappLink("Hi KelasaHub, I want to report someone asking for money in your name.")}>WhatsApp</a> or at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with screenshots and the number or email used
          </li>
          <li>
            If you have lost money, call the national cyber-crime helpline <strong>1930</strong> immediately or report at{" "}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
              cybercrime.gov.in
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "employers",
    title: "Hiring partners",
    body: (
      <p>
        We expect our hiring partners to follow the same rule for candidates placed through KelasaHub. If an employer or
        anyone on their behalf asks you for money to get or keep a job, tell us — we will take it up with them.
      </p>
    ),
  },
  {
    id: "more",
    title: "More information",
    body: (
      <p>
        See our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link> for how we work and
        how we handle your data.
      </p>
    ),
  },
];

export default function ZeroFeePage() {
  return (
    <LegalPage
      eyebrow="Candidate safety"
      title="Zero-Fee"
      accent="Policy."
      intro={<p>₹0 to register. ₹0 to process. ₹0 after you join. If anyone asks you for money in KelasaHub&apos;s name, it&apos;s a scam.</p>}
      updated={POLICY_UPDATED}
      current="/zero-fee-policy"
      sections={sections}
    />
  );
}
