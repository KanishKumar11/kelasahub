import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Job, Partner } from "@/lib/models";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { JobForm } from "@/components/admin/JobForm";

export default async function JobEditPage(props: PageProps<"/admin/jobs/[id]">) {
  const { id } = await props.params;
  const isNew = id === "new";
  if (!isNew && !/^[a-f0-9]{24}$/.test(id)) notFound();
  const session = await requireSession();
  await connectDB();
  const [job, partners] = await Promise.all([
    isNew ? null : Job.findById(id).lean(),
    Partner.find({ isActive: true }).sort({ name: 1 }).select("name").lean(),
  ]);
  if (!isNew && !job) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/admin/jobs" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Jobs
      </Link>
      <PageHeader title={isNew ? "New job" : job!.title} subtitle={isNew ? "Publish a new opening on the website." : `kelasahub.in/jobs/${job!.slug}`} />
      <JobForm
        id={isNew ? null : id}
        canDelete={!isNew && session.role === "admin"}
        partners={partners.map((p) => ({ id: String(p._id), name: p.name }))}
        values={{
          title: job?.title ?? "",
          slug: job?.slug ?? "",
          partner: job?.partner ? String(job.partner) : String(partners.find((p) => p.name === "Nex-Gen")?._id ?? ""),
          salary: job?.salary ?? "",
          salaryMin: job?.salaryMin != null ? String(job.salaryMin) : "",
          salaryMax: job?.salaryMax != null ? String(job.salaryMax) : "",
          description: job?.description ?? "",
          requirements: job?.requirements ?? "",
          location: job?.location ?? "HBR Layout, Bangalore",
          openings: job?.openings != null ? String(job.openings) : "",
          image: job?.image ?? "",
          order: String(job?.order ?? 0),
          isActive: job?.isActive ?? true,
        }}
      />
    </div>
  );
}
