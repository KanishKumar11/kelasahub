import Link from "next/link";
import { FileText } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Candidate, Resume } from "@/lib/models";
import { resumeSchema } from "@/lib/resume";
import { resumeDownloadsSince } from "@/lib/resume-store";
import { candidateWhatsApp } from "@/lib/constants";
import { Badge, Card, PageHeader, btn, relTime } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/site/BrandIcons";

export const metadata = { title: "Resumes" };

const DAY = 86_400_000;

export default async function ResumesPage() {
  await connectDB();
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const [docs, downloads30, matchedTotal, matched30] = await Promise.all([
    Resume.find().sort({ updatedAt: -1 }).limit(300).lean(),
    resumeDownloadsSince(30),
    Candidate.countDocuments({ source: "Resume Builder" }),
    Candidate.countDocuments({ source: "Resume Builder", dateApplied: { $gte: since30 } }),
  ]);
  const emails = docs.map((d) => d.email);
  const candidates = await Candidate.find({ email: { $in: emails } })
    .sort({ dateApplied: -1 })
    .select("email candidateId screeningStatus source")
    .lean();
  const byEmail = new Map<string, (typeof candidates)[number]>();
  for (const c of candidates) if (!byEmail.has(c.email)) byEmail.set(c.email, c);

  const rows = docs.map((d) => {
    const r = resumeSchema.safeParse(d.data);
    return { id: String(d._id), email: d.email, updatedAt: d.updatedAt, r: r.success ? r.data : null, candidate: byEmail.get(d.email) };
  });

  const stats = [
    { label: "PDF downloads", value: downloads30, hint: "last 30 days, signed in or not" },
    { label: "Saved to accounts", value: docs.length, hint: `${rows.filter((r) => !r.candidate).length} not yet in the pipeline` },
    { label: "Sent to recruiters", value: matchedTotal, hint: `+${matched30} in the last 30 days`, href: "/admin/candidates?source=Resume%20Builder" },
  ];

  return (
    <>
      <PageHeader
        title="Resumes"
        subtitle="Resumes candidates built and saved with the free resume builder. Those who chose “Get matched” are already in Candidates."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => {
          const body = (
            <Card className="h-full p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted">{s.hint}</p>
            </Card>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="transition hover:opacity-90">
              {body}
            </Link>
          ) : (
            <div key={s.label}>{body}</div>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No saved resumes yet. They appear here when candidates save one to their account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Languages</th>
                  <th className="px-3 py-3">Updated</th>
                  <th className="px-3 py-3">Pipeline</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rows.map(({ id, email, updatedAt, r, candidate }) => (
                  <tr key={id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{r?.name || "—"}</p>
                      <p className="text-xs text-muted">{r?.headline || "No headline"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{email}</p>
                      {r?.phone && (
                        <a href={candidateWhatsApp(r.phone)} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1da851] hover:underline">
                          <WhatsAppIcon className="size-3.5" /> {r.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{r?.languages.map((l) => l.name).join(", ") || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted">{relTime(updatedAt)}</td>
                    <td className="px-3 py-3">
                      {candidate ? (
                        <Link href={`/admin/candidates/${candidate._id}`} className="inline-flex flex-col gap-1 hover:underline">
                          <span className="font-mono text-xs font-semibold">{candidate.candidateId}</span>
                          <Badge value={candidate.screeningStatus} />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">Not opted in</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <a href={`/api/admin/pdf/resume?email=${encodeURIComponent(email)}`} target="_blank" className={btn.secondary}>
                        <FileText className="size-4" /> PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
