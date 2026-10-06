import "server-only";
import { connectDB } from "./db";
import { Candidate } from "./models";
import { publicStage } from "./constants";

export type StatusResult = {
  candidateId: string;
  firstName: string;
  role: string;
  company: string | null;
  appliedOn: string;
  interviewDate: string | null;
  joiningDate: string | null;
  stage: { step: number; label: string };
};

/** True when a candidate with this ID has this email on file. */
export async function candidateEmailMatches(candidateId: string, email: string) {
  await connectDB();
  return !!(await Candidate.exists({ candidateId, email }));
}

/** Candidate-facing status lookup — only called after the email on file has been verified by OTP. */
export async function lookupStatus(candidateId: string, email: string): Promise<StatusResult | null> {
  await connectDB();
  const c = await Candidate.findOne({ candidateId, email })
    .populate<{ partner: { name: string; location: string } | null }>("partner", "name location")
    .lean();
  if (!c) return null;
  const iso = (d?: Date | null) => (d ? new Date(d).toISOString() : null);
  return {
    candidateId: c.candidateId,
    firstName: c.name.split(" ")[0],
    role: c.role ?? "",
    company: c.partner ? `${c.partner.name}${c.partner.location ? ", " + c.partner.location : ""}` : null,
    appliedOn: new Date(c.dateApplied).toISOString(),
    interviewDate: c.interviewStatus === "Scheduled" || c.interviewStatus === "Rescheduled" ? iso(c.interviewDate) : null,
    joiningDate: c.overallStatus === "Selected" ? iso(c.joiningDate) : null,
    stage: publicStage(c),
  };
}
