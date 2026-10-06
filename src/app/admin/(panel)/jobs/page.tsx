import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Candidate, Job } from "@/lib/models";
import { Card, PageHeader, btn } from "@/components/admin/ui";
import { JobToggle } from "@/components/admin/JobToggle";

export const metadata = { title: "Jobs" };

export default async function JobsPage() {
  await connectDB();
  const [jobs, counts] = await Promise.all([
    Job.find().sort({ isActive: -1, order: 1, createdAt: -1 }).populate<{ partner: { name: string } | null }>("partner", "name").lean(),
    Candidate.aggregate<{ _id: string; total: number; fresh: number; selected: number }>([
      {
        $group: {
          _id: "$role",
          total: { $sum: 1 },
          fresh: { $sum: { $cond: [{ $eq: ["$screeningStatus", "New"] }, 1, 0] } },
          selected: { $sum: { $cond: [{ $eq: ["$overallStatus", "Selected"] }, 1, 0] } },
        },
      },
    ]),
  ]);
  const byRole = new Map(counts.map((c) => [c._id, c]));

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle={`${jobs.filter((j) => j.isActive).length} live on the website · ${jobs.length} total`}
        actions={
          <Link href="/admin/jobs/new" className={btn.primary}>
            <Plus className="size-4" /> New job
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {jobs.map((j) => {
          const c = byRole.get(j.title);
          return (
            <Card key={String(j._id)} className={`flex gap-4 p-4 ${j.isActive ? "" : "opacity-60"}`}>
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {j.image && <Image src={j.image} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/jobs/${j._id}`} className="font-semibold leading-snug hover:text-teal-deep">
                    {j.title}
                  </Link>
                  <JobToggle id={String(j._id)} active={!!j.isActive} />
                </div>
                <p className="mt-0.5 text-sm font-medium text-teal-deep">{j.salary}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {j.partner?.name ?? "No partner"} · {j.location}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-3 text-xs">
                  <Link href={`/admin/candidates?q=${encodeURIComponent(j.title)}`} className="font-semibold text-ink hover:text-teal-deep">
                    {c?.total ?? 0} applicants
                  </Link>
                  {!!c?.fresh && <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">{c.fresh} new</span>}
                  {!!c?.selected && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{c.selected} selected</span>}
                  {j.isActive && (
                    <a href={`/jobs/${j.slug}`} target="_blank" className="ml-auto inline-flex items-center gap-1 text-muted hover:text-ink">
                      View <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
