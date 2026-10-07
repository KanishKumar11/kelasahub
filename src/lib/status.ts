import "server-only";
import { connectDB } from "./db";
import { Candidate } from "./models";
import { publicStage } from "./constants";
import { applicationPdfPath } from "./pdf/applications";

export type StatusResult = {
  candidateId: string;
  firstName: string;
  role: string;
  company: string | null;
  jobSlug: string | null;
  appliedOn: string;
  interviewDate: string | null;
  joiningDate: string | null;
  stage: { step: number; label: string };
  pdfUrl: string;
};

/** True when a candidate with this ID has this email on file. */
export async function candidateEmailMatches(candidateId: string, email: string) {
  await connectDB();
  return !!(await Candidate.exists({ candidateId, email }));
}

function find(filter: Record<string, unknown>) {
  return Candidate.find(filter)
    .sort({ dateApplied: -1 })
    .populate<{ partner: { name: string; location: string } | null }>("partner", "name location")
    .populate<{ job: { slug: string; isActive: boolean } | null }>("job", "slug isActive")
    .lean();
}
type Row = Awaited<ReturnType<typeof find>>[number];

async function toResult(c: Row): Promise<StatusResult> {
  const iso = (d?: Date | null) => (d ? new Date(d).toISOString() : null);
  return {
    candidateId: c.candidateId,
    firstName: c.name.split(" ")[0],
    role: c.role ?? "",
    company: c.partner ? `${c.partner.name}${c.partner.location ? ", " + c.partner.location : ""}` : null,
    jobSlug: c.job?.isActive ? c.job.slug : null,
    appliedOn: new Date(c.dateApplied).toISOString(),
    interviewDate: c.interviewStatus === "Scheduled" || c.interviewStatus === "Rescheduled" ? iso(c.interviewDate) : null,
    joiningDate: c.overallStatus === "Selected" ? iso(c.joiningDate) : null,
    stage: publicStage(c),
    pdfUrl: await applicationPdfPath(String(c._id)),
  };
}

/** Candidate-facing status lookup — only called after the email on file has been verified by OTP. */
export async function lookupStatus(candidateId: string, email: string): Promise<StatusResult | null> {
  await connectDB();
  const [c] = await find({ candidateId, email });
  return c ? toResult(c) : null;
}

/** Every application made with this (verified) email, newest first — the candidate dashboard. */
export async function applicationsFor(email: string) {
  await connectDB();
  const rows = await find({ email });
  const applications = await Promise.all(rows.map(toResult));
  const since = Date.now() - 86_400_000;
  return {
    name: rows[0]?.name ?? "",
    phone: rows[0]?.phone ?? "",
    applications,
    upcomingInterviews: applications.filter((a) => a.interviewDate && new Date(a.interviewDate).getTime() > since).length,
  };
}
