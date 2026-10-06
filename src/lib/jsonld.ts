import { OFFICE, SITE } from "./constants";
import type { PublicJob } from "./queries";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/assets/kelasahub-icon.png`,
    email: SITE.email,
    telephone: SITE.phoneTel,
    hasMap: OFFICE.mapLink,
    address: {
      "@type": "PostalAddress",
      streetAddress: "42, Balaji St, Gurumurthy Reddy Layout, Ramamurthy Nagar",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560016",
      addressCountry: "IN",
    },
    sameAs: [SITE.instagram],
  };
}

/** Google for Jobs structured data — lets openings appear in Google job search. */
export function jobPostingLd(job: PublicJob) {
  const validThrough = new Date(new Date(job.updatedAt).getTime() + 60 * 86_400_000).toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${job.description}</p><p><strong>Requirements:</strong> ${job.requirements}</p><p>${job.salary}</p>`,
    datePosted: job.createdAt,
    validThrough,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || SITE.name,
      sameAs: SITE.url,
      logo: `${SITE.url}/assets/kelasahub-icon.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.split(",")[0] || "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    ...(job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: { "@type": "QuantitativeValue", maxValue: job.salaryMax, unitText: "MONTH" },
          },
        }
      : {}),
    directApply: true,
  };
}
