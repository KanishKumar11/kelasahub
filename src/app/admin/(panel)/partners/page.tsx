import { connectDB } from "@/lib/db";
import { Candidate, Job, Partner } from "@/lib/models";
import { PageHeader } from "@/components/admin/ui";
import { PartnerManager } from "@/components/admin/PartnerManager";

export const metadata = { title: "Partners" };

export default async function PartnersPage() {
  await connectDB();
  const [partners, cand, jobs] = await Promise.all([
    Partner.find().sort({ isActive: -1, name: 1 }).lean(),
    Candidate.aggregate<{ _id: unknown; total: number; selected: number }>([
      { $match: { partner: { $ne: null } } },
      { $group: { _id: "$partner", total: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ["$overallStatus", "Selected"] }, 1, 0] } } } },
    ]),
    Job.aggregate<{ _id: unknown; n: number }>([{ $match: { isActive: true } }, { $group: { _id: "$partner", n: { $sum: 1 } } }]),
  ]);
  const c = new Map(cand.map((x) => [String(x._id), x]));
  const j = new Map(jobs.map((x) => [String(x._id), x.n]));

  return (
    <>
      <PageHeader title="Partners" subtitle="Companies you place candidates with. Shown in the PDF header and the website marquee." />
      <PartnerManager
        partners={partners.map((p) => ({
          id: String(p._id),
          name: p.name,
          location: p.location ?? "",
          address: p.address ?? "",
          contactPerson: p.contactPerson ?? "",
          phone: p.phone ?? "",
          email: p.email ?? "",
          showOnSite: !!p.showOnSite,
          isActive: !!p.isActive,
          candidates: c.get(String(p._id))?.total ?? 0,
          selected: c.get(String(p._id))?.selected ?? 0,
          liveJobs: j.get(String(p._id)) ?? 0,
        }))}
      />
    </>
  );
}
