import Link from "next/link";
import { UserPlus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Candidate, Partner } from "@/lib/models";
import { buildCandidateQuery, readFilters } from "@/lib/candidate-query";
import { PageHeader, btn } from "@/components/admin/ui";
import { CandidateFiltersBar } from "@/components/admin/CandidateFiltersBar";
import { CandidateTable, type CandidateRow } from "@/components/admin/CandidateTable";
import { ImportButton } from "@/components/admin/ImportButton";

export const metadata = { title: "Candidates" };
const PAGE_SIZE = 50;

export default async function CandidatesPage(props: PageProps<"/admin/candidates">) {
  const filters = readFilters(await props.searchParams);
  const { query, sort } = buildCandidateQuery(filters);
  const page = Math.max(1, Number(filters.page) || 1);

  await connectDB();
  const [rows, count, partners, sources] = await Promise.all([
    Candidate.find(query)
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate<{ partner: { _id: unknown; name: string } | null }>("partner", "name")
      .select("-activity -education")
      .lean(),
    Candidate.countDocuments(query),
    Partner.find({ isActive: true }).sort({ name: 1 }).select("name").lean(),
    Candidate.distinct("source"),
  ]);

  // Flag people who applied more than once (same phone).
  const phones = [...new Set(rows.map((r) => r.phone))];
  const dupAgg = await Candidate.aggregate<{ _id: string; n: number }>([
    { $match: { phone: { $in: phones } } },
    { $group: { _id: "$phone", n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
  ]);
  const dups = new Map(dupAgg.map((d) => [d._id, d.n]));

  const data: CandidateRow[] = rows.map((r) => ({
    id: String(r._id),
    candidateId: r.candidateId,
    name: r.name,
    phone: r.phone,
    email: r.email ?? "",
    role: r.role ?? "",
    source: r.source ?? "",
    partner: r.partner?.name ?? "",
    area: r.area ?? "",
    dateApplied: new Date(r.dateApplied).toISOString(),
    screeningStatus: r.screeningStatus,
    interviewStatus: r.interviewStatus,
    overallStatus: r.overallStatus ?? "",
    lastContacted: r.lastContacted ? new Date(r.lastContacted).toISOString() : null,
    notes: r.notes ?? "",
    dupCount: dups.get(r.phone) ?? 1,
  }));

  const qs = new URLSearchParams(
    Object.entries(filters).filter(([k, v]) => v && k !== "page") as [string, string][],
  ).toString();
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Candidates"
        subtitle={`${count} candidate${count === 1 ? "" : "s"}${qs ? " match your filters" : ""}`}
        actions={
          <>
            <ImportButton />
            <a href={`/api/admin/candidates/export?${qs}`} className={btn.secondary}>
              Export Excel
            </a>
            <Link href="/admin/candidates/new" className={btn.primary}>
              <UserPlus className="size-4" /> Add candidate
            </Link>
          </>
        }
      />
      <CandidateFiltersBar
        filters={filters}
        partners={partners.map((p) => ({ id: String(p._id), name: p.name }))}
        sources={sources.filter(Boolean).sort()}
      />
      <CandidateTable
        rows={data}
        partners={partners.map((p) => ({ id: String(p._id), name: p.name }))}
        filterQs={qs}
        total={count}
      />
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link className={btn.secondary} href={`?${qs}${qs ? "&" : ""}page=${page - 1}`}>
                Previous
              </Link>
            )}
            {page < pages && (
              <Link className={btn.secondary} href={`?${qs}${qs ? "&" : ""}page=${page + 1}`}>
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
