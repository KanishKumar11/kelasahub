import "server-only";
import { connectDB } from "./db";
import { Job, Partner } from "./models";

export type PublicJob = {
  id: string;
  slug: string;
  title: string;
  salary: string;
  salaryMax: number | null;
  description: string;
  requirements: string;
  location: string;
  image: string;
  company: string;
  freshersOk: boolean;
  updatedAt: string;
  createdAt: string;
};

export async function getActiveJobs(): Promise<PublicJob[]> {
  await connectDB();
  const jobs = await Job.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate<{ partner: { name: string } | null }>("partner", "name")
    .lean();
  return jobs.map((j) => ({
    id: String(j._id),
    slug: j.slug,
    title: j.title,
    salary: j.salary ?? "",
    salaryMax: j.salaryMax ?? null,
    description: j.description ?? "",
    requirements: j.requirements ?? "",
    location: j.location ?? "",
    image: j.image ?? "",
    company: j.partner?.name ?? "",
    freshersOk: /fresher/i.test(`${j.requirements} ${j.description}`),
    updatedAt: new Date(j.updatedAt).toISOString(),
    createdAt: new Date(j.createdAt).toISOString(),
  }));
}

export async function getJobBySlug(slug: string) {
  const jobs = await getActiveJobs();
  return jobs.find((j) => j.slug === slug) ?? null;
}

export async function getSitePartners(): Promise<string[]> {
  await connectDB();
  const partners = await Partner.find({ isActive: true, showOnSite: true }).sort({ createdAt: 1 }).lean();
  return partners.map((p) => p.name);
}
