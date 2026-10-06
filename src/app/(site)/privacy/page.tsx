import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { OFFICE, SITE } from "@/lib/constants";
import { POLICY_UPDATED } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How KelasaHub collects, uses, shares and protects candidate and employer information.",
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          KelasaHub (“KelasaHub”, “we”, “us”) is a recruitment consultancy that connects job seekers with call-centre,
          BPO and related employers in Bengaluru. Our office is at {OFFICE.address}.
        </p>
        <p>
          This policy explains what personal data we collect through <strong>kelasahub.in</strong>,
          our chatbot, WhatsApp, phone and walk-ins, why we collect it, who we share it with and the choices you have. We
          process personal data in line with India&apos;s Digital Personal Data Protection Act, 2023 and the Information
          Technology Act, 2000.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: (
      <>
        <h3>When you apply or join the talent pool</h3>
        <ul>
          <li>Name, mobile number and email address</li>
          <li>Preferred work area, pincode, address and nationality</li>
          <li>Education, employment status, years of experience and last company</li>
          <li>Languages you speak, shift preference and expected salary</li>
          <li>The role you applied for and any notes from your conversations with our team</li>
        </ul>
        <h3>When you use the website</h3>
        <ul>
          <li>The email verification codes we send you (stored only in scrambled form, deleted within an hour)</li>
          <li>Basic technical data such as IP address, used briefly to stop spam and abuse</li>
        </ul>
        <h3>When you request manpower (employers)</h3>
        <ul>
          <li>Your name, designation, company, business type, phone, email and hiring needs</li>
        </ul>
        <p>We do not ask for Aadhaar, PAN, bank details or other sensitive documents on this website.</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <>
        <ul>
          <li>To screen your profile and match you with suitable job openings</li>
          <li>To share your profile with hiring partners for roles you applied for or agreed to be considered for</li>
          <li>To contact you by call, WhatsApp, SMS or email about your application, interviews and joining</li>
          <li>To verify your email address and let you check your application status</li>
          <li>To follow up after you join (for example, in your first month) to support your placement</li>
          <li>To respond to employer enquiries and send quotations</li>
          <li>To prevent fraud, spam and misuse of our services, and to meet legal obligations</li>
        </ul>
        <p>We do not sell your personal data, and we do not use it for advertising.</p>
      </>
    ),
  },
  {
    id: "consent",
    title: "Your consent",
    body: (
      <>
        <p>
          We process your data on the basis of the consent you give when you apply, join the talent pool or contact us.
          You can withdraw consent at any time by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or messaging
          us on WhatsApp. After withdrawal we will stop sharing your profile with employers and delete or anonymise your
          data, except where we must keep it by law. Withdrawing consent does not affect processing that already took
          place.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <ul>
          <li>
            <strong>Hiring partners</strong> — the companies whose roles you apply or are matched for receive your
            application details (for example, an application form with your contact, education and experience
            details). They use it to make hiring decisions under their own privacy policies.
          </li>
          <li>
            <strong>Service providers</strong> who help us run KelasaHub — website hosting, our cloud database (MongoDB
            Atlas) and our email provider — only to the extent needed to provide their services to us.
          </li>
          <li>
            <strong>Authorities</strong> when required by law, court order or to protect the rights and safety of
            candidates, employers or KelasaHub.
          </li>
        </ul>
        <p>
          Some of these providers may store data on servers outside India. Where that happens, we rely on providers with
          appropriate security measures and follow any transfer restrictions notified under Indian law.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Kept for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Candidate profiles and application history</td>
              <td>24 months after your last activity with us, so we can match you to future roles</td>
            </tr>
            <tr>
              <td>Email verification codes</td>
              <td>Deleted automatically within 1 hour</td>
            </tr>
            <tr>
              <td>Employer enquiries</td>
              <td>24 months after the last interaction</td>
            </tr>
            <tr>
              <td>Records we must keep by law</td>
              <td>For the period the law requires</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4">You can ask us to delete your data sooner — see “Your rights” below.</p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the Digital Personal Data Protection Act, 2023 you can:</p>
        <ul>
          <li>Ask for a summary of the personal data we hold about you and how we use it</li>
          <li>Ask us to correct, complete or update your data</li>
          <li>Ask us to erase your data once it is no longer needed</li>
          <li>Withdraw your consent</li>
          <li>Nominate another person to exercise these rights if you are unable to</li>
          <li>Raise a grievance with us, and if unresolved, with the Data Protection Board of India</li>
        </ul>
        <p>
          Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> from the address you applied with, or call{" "}
          <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>. We may ask you to verify your identity first.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & third-party content",
    body: (
      <>
        <p>
          The public website does not use advertising or analytics cookies. We use one essential cookie to keep our staff
          signed in to the admin panel; it is not set for candidates.
        </p>
        <p>
          Our “Visit us” section shows an embedded Google Map, and links open WhatsApp and Instagram. When you interact
          with these, Google, WhatsApp or Meta may collect data under their own privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        Data is sent over encrypted (HTTPS) connections, stored in an access-controlled cloud database, and only our team
        members with a login can view candidate records. Verification codes are stored in scrambled (hashed) form and
        expire after 10 minutes. No system is perfectly secure, but if a breach affecting your data occurs, we will
        notify you and the authorities as required by law.
      </p>
    ),
  },
  {
    id: "children",
    title: "Age requirement",
    body: (
      <p>
        Our services are meant for people aged 18 and above. We do not knowingly collect data from children. If you
        believe a person under 18 has applied, contact us and we will delete their information.
      </p>
    ),
  },
  {
    id: "grievances",
    title: "Contact & grievances",
    body: (
      <>
        <p>For questions, requests or complaints about your personal data, contact our Grievance Officer:</p>
        <div className="callout">
          <p>
            <strong>Grievance Officer, KelasaHub</strong>
            <br />
            Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <br />
            Phone / WhatsApp: <a href={`tel:${SITE.phoneTel}`}>{SITE.phoneDisplay}</a>
            <br />
            Address: {OFFICE.address}
          </p>
        </div>
        <p className="mt-4">We acknowledge grievances within 24 hours and aim to resolve them within 15 days.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as our services or the law change. The “Last updated” date at the top shows the latest
        version. For significant changes we will notify candidates by email or on this website. See also our{" "}
        <Link href="/terms">Terms of Use</Link> and <Link href="/zero-fee-policy">Zero-Fee Policy</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy"
      accent="Policy."
      intro={<p>Your details are used to find you a job — nothing else. Here&apos;s exactly what we collect, why, and who sees it.</p>}
      updated={POLICY_UPDATED}
      current="/privacy"
      sections={sections}
    />
  );
}
