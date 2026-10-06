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

/** Candidate-facing status lookup — requires both the Candidate ID and the phone used to apply. */
export async function lookupStatus(candidateId: string, phone: string): Promise<StatusResult | null> {
  await connectDB();
  const c = await Candidate.findOne({ candidateId, phone })
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
