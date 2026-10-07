import type { Metadata } from "next";
import { OFFICE } from "@/lib/constants";
import { organizationLd } from "@/lib/jsonld";
import { PageHero } from "@/components/site/PageHero";
import { Visit } from "@/components/site/Visit";
import { JsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: "Contact & Office — Ramamurthy Nagar, Bangalore",
  description: `Visit, call or WhatsApp KelasaHub. Head office: ${OFFICE.address}. Walk-ins welcome for job seekers.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={organizationLd()} />
      <PageHero
        crumbs={[{ label: "Contact", href: "/contact" }]}
        eyebrow="Visit us"
        title={
          <>
            Walk in. <span className="accent text-teal-deep">Say hello.</span>
          </>
        }
        lead="Free to join, zero rupees to pay. Walk in, call or WhatsApp — whichever is easiest."
      />
      <Visit intro={false} />
    </>
  );
}
