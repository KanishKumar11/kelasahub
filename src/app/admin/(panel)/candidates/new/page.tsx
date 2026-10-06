import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Job, Partner } from "@/lib/models";
import { PageHeader } from "@/components/admin/ui";
import { CandidateForm } from "@/components/admin/CandidateForm";

export const metadata = { title: "Add candidate" };

export default async function NewCandidatePage() {
  await connectDB();
  const [partners, jobs] = await Promise.all([
    Partner.find({ isActive: true }).sort({ name: 1 }).select("name").lean(),
    Job.find().select("title").lean(),
  ]);
  return (
    <div className="max-w-5xl">
      <Link href="/admin/candidates" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Candidates
      </Link>
      <PageHeader title="Add candidate" subtitle="For walk-ins, phone enquiries and referrals. A Candidate ID is generated automatically." />
      <CandidateForm
        id={null}
        partners={partners.map((p) => ({ id: String(p._id), name: p.name }))}
        roles={jobs.map((j) => j.title)}
        values={{
          name: "", phone: "", email: "", source: "Walk-in", role: "", partner: "", area: "", nationality: "Indian",
          address: "", pincode: "", languages: "", employmentStatus: "", expYears: "", lastCompany: "", targetSalary: "",
          referredBy: "KelasaHub", edu_tenth: "", edu_twelfth: "", edu_graduate: "", edu_postGraduate: "",
          interviewDate: "", dateSelected: "", joiningDate: "", lastContacted: "", notes: "",
        }}
      />
    </div>
  );
}
