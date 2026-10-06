import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Candidate, Job, nextCandidateId } from "@/lib/models";
import { applySchema, firstError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(req, "apply", 8)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
  }
  const parsed = applySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const d = parsed.data;

  // Silently accept bot submissions without storing them.
  if (d.website) return NextResponse.json({ candidateId: "K-0000-0000" });

  await connectDB();

  // Same person applying for the same role again within 3 days → reuse their ID.
  const recent = await Candidate.findOne({
    phone: d.phone,
    role: d.role,
    dateApplied: { $gte: new Date(Date.now() - 3 * 86_400_000) },
  }).lean();
  if (recent) {
    return NextResponse.json({ candidateId: recent.candidateId, duplicate: true });
  }

  const job = d.jobId && /^[a-f0-9]{24}$/.test(d.jobId) ? await Job.findById(d.jobId).lean() : null;
  const candidateId = await nextCandidateId();
  await Candidate.create({
    candidateId,
    source: d.source,
    role: d.role,
    job: job?._id ?? null,
    partner: job?.partner ?? null,
    name: d.name,
    phone: d.phone,
    email: d.email,
    nationality: d.nationality,
    address: d.address,
    pincode: d.pincode,
    area: d.area,
    languages: d.languages,
    intlLanguages: d.intlLanguages,
    employmentStatus: d.employmentStatus,
    experienceLevel: d.experienceLevel,
    expYears: d.expYears,
    lastCompany: d.lastCompany,
    shiftPreference: d.shiftPreference,
    targetSalary: d.targetSalary,
    education: d.education,
    activity: [{ by: "Website", type: "system", text: `Applied via ${d.source} for ${d.role}` }],
  });

  return NextResponse.json({ candidateId });
}
