import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Candidate, Job, nextCandidateId } from "@/lib/models";
import { applySchema, firstError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { verifyEmailToken } from "@/lib/otp";
import { sendApplicationConfirmation } from "@/lib/mail";
import { applicationPdfPath, applicationPdfUrl } from "@/lib/pdf/applications";

export async function POST(req: Request) {
  if (!rateLimit(req, "apply", 8)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
  }
  const parsed = applySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const d = parsed.data;

  // Silently accept bot submissions without storing them.
  if (d.website) return NextResponse.json({ candidateId: "K-0000-0000" });

  if (!(await verifyEmailToken(d.emailToken, d.email, "apply"))) {
    return NextResponse.json({ error: "Please verify your email address again.", needsVerification: true }, { status: 401 });
  }

  await connectDB();

  // Same person applying for the same role again within 3 days → reuse their ID.
  const recent = await Candidate.findOne({
    phone: d.phone,
    role: d.role,
    dateApplied: { $gte: new Date(Date.now() - 3 * 86_400_000) },
  });
  if (recent) {
    // They just verified this email, so make it the one on file — otherwise the
    // status tracker (which emails a code to the address on file) wouldn't work for them.
    if (recent.email !== d.email) {
      recent.activity.push({ by: "Website", type: "system", text: `Re-applied; email changed ${recent.email || "—"} → ${d.email} (verified)` });
      recent.email = d.email;
    }
    recent.emailVerifiedAt = new Date();
    recent.consentAt ??= new Date();
    await recent.save();
    return NextResponse.json({ candidateId: recent.candidateId, duplicate: true, pdfUrl: await applicationPdfPath(String(recent._id)) });
  }

  const job = d.jobId && /^[a-f0-9]{24}$/.test(d.jobId) ? await Job.findById(d.jobId).lean() : null;
  const candidateId = await nextCandidateId();
  const created = await Candidate.create({
    candidateId,
    source: d.source,
    role: d.role,
    job: job?._id ?? null,
    partner: job?.partner ?? null,
    name: d.name,
    phone: d.phone,
    email: d.email,
    emailVerifiedAt: new Date(),
    consentAt: new Date(),
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
    activity: [{ by: "Website", type: "system", text: `Applied via ${d.source} for ${d.role} · email ${d.email} verified` }],
  });

  // Don't make the candidate wait on SMTP; a failed confirmation is logged, not fatal.
  const id = String(created._id);
  void sendApplicationConfirmation({ email: d.email, name: d.name, role: d.role, candidateId, pdfUrl: await applicationPdfUrl(id) });

  return NextResponse.json({ candidateId, pdfUrl: await applicationPdfPath(id) });
}
