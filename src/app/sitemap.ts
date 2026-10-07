import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getActiveJobs } from "@/lib/queries";
import { RESUME_EXAMPLES } from "@/lib/resume-examples";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getActiveJobs().catch(() => []);
  return [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/resume-builder`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/employers`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/status`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE.url}/zero-fee-policy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...RESUME_EXAMPLES.map((e) => ({ url: `${SITE.url}/resume-builder/${e.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...jobs.map((j) => ({ url: `${SITE.url}/jobs/${j.slug}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
