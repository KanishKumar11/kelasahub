import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getActiveJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getActiveJobs().catch(() => []);
  return [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/status`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE.url}/zero-fee-policy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...jobs.map((j) => ({ url: `${SITE.url}/jobs/${j.slug}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
