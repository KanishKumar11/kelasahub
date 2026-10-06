import { connectDB } from "@/lib/db";
import { Candidate, Partner } from "@/lib/models";
import { guard } from "@/lib/api-auth";
import { buildCandidateQuery, readFilters } from "@/lib/candidate-query";
import { pdfResponse, renderShortlist } from "@/lib/pdf/render";
import { fmt } from "@/lib/pdf/shared";

// GET /api/admin/pdf/shortlist?ids=a,b  or  ?screening=Shortlisted&partner=… (same filters as the list)
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const ids = (sp.ids ?? "").split(",").filter((x) => /^[a-f0-9]{24}$/.test(x));
  const { query, sort } = buildCandidateQuery(readFilters(sp));

  await connectDB();
  const docs = await Candidate.find(ids.length ? { _id: { $in: ids } } : query)
    .sort(ids.length ? { dateApplied: 1 } : sort)
    .limit(1000)
    .populate<{ partner: { name: string } | null }>("partner", "name")
    .select("-activity")
    .lean();

  const partnerNames = [...new Set(docs.map((d) => d.partner?.name).filter(Boolean))];
  const filterPartner = sp.partner && /^[a-f0-9]{24}$/.test(sp.partner) ? await Partner.findById(sp.partner).lean() : null;
  const forWhom = filterPartner?.name ?? (partnerNames.length === 1 ? partnerNames[0] : null);

  const rows = docs.map((c) => ({
    candidateId: c.candidateId,
    name: c.name,
    phone: c.phone,
    role: c.role ?? "",
    area: c.area ?? "",
    experience:
      c.employmentStatus === "Experienced"
        ? [c.expYears ? `${c.expYears} yrs` : "Experienced", c.lastCompany].filter(Boolean).join(" · ")
        : c.employmentStatus || c.experienceLevel || "",
    languages: [...(c.languages ?? []), ...(c.intlLanguages ?? [])].join(", "),
    shift: c.shiftPreference ?? "",
    salary: c.targetSalary ? `₹${String(c.targetSalary).replace(/^₹/, "")}` : "",
    status: c.overallStatus || (c.interviewStatus !== "Not Scheduled" ? `Interview: ${c.interviewStatus}` : c.screeningStatus),
    notes: c.notes ?? "",
  }));

  const title = forWhom ? `Candidate Shortlist — ${forWhom}` : "Candidate Shortlist";
  const buf = await renderShortlist(rows, title, `Prepared by KelasaHub · ${fmt(new Date())}`);
  return pdfResponse(buf, `${title.replace(/\W+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
