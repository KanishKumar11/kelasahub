import "server-only";
import { connectDB } from "./db";
import { Candidate, Counter, Job, Resume, nextCandidateId } from "./models";
import { LANGUAGE_LEVELS, emptyResume, resumeSchema, type ResumeData } from "./resume";

export async function getSavedResume(email: string): Promise<{ data: ResumeData; updatedAt: string } | null> {
  await connectDB();
  const doc = await Resume.findOne({ email }).lean();
  if (!doc) return null;
  const parsed = resumeSchema.safeParse(doc.data);
  return parsed.success ? { data: parsed.data, updatedAt: new Date(doc.updatedAt).toISOString() } : null;
}

export async function saveResume(email: string, data: ResumeData) {
  await connectDB();
  await Resume.updateOne({ email }, { $set: { data } }, { upsert: true });
}

export async function deleteResume(email: string) {
  await connectDB();
  await Resume.deleteOne({ email });
}

/* Anonymous daily download counts for the admin dashboard (no personal data). */
const dayKey = (d = new Date()) => `resume-dl-${d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })}`;

export async function countResumeDownload() {
  await connectDB();
  await Counter.updateOne({ _id: dayKey() }, { $inc: { seq: 1 } }, { upsert: true });
}

export async function resumeDownloadsSince(days: number) {
  await connectDB();
  const keys = Array.from({ length: days }, (_, i) => dayKey(new Date(Date.now() - i * 86_400_000)));
  const rows = await Counter.find({ _id: { $in: keys } }).lean();
  return rows.reduce((n, r) => n + (r.seq ?? 0), 0);
}

/**
 * "Get matched to jobs": turns a resume into a candidate in the admin pipeline (source "Resume Builder").
 * Only called after the candidate verified their email and ticked consent. Re-opting in updates the same record.
 */
export async function matchFromResume(email: string, r: ResumeData, opts: { phone: string; role: string; jobId: string | null }) {
  await connectDB();
  const job = opts.jobId ? await Job.findById(opts.jobId).lean() : null;
  const role = job?.title ?? opts.role;
  const latest = r.experience.find((e) => e.company);
  const degrees = r.education.filter((e) => e.degree).map((e) => [e.degree, e.school, e.year].filter(Boolean).join(", "));
  const fields = {
    name: r.name,
    phone: opts.phone,
    role,
    job: job?._id ?? null,
    partner: job?.partner ?? null,
    languages: r.languages.map((l) => l.name),
    lastCompany: latest?.company ?? "",
    employmentStatus: r.experience.some((e) => e.company || e.role) ? ("Experienced" as const) : ("Fresher" as const),
    education: { tenth: "", twelfth: "", graduate: degrees[0] ?? "", postGraduate: "" },
    emailVerifiedAt: new Date(),
    consentAt: new Date(),
  };

  const open = await Candidate.findOne({ email, source: "Resume Builder", overallStatus: { $nin: ["Selected", "Rejected", "Dropped Out"] } });
  if (open) {
    Object.assign(open, fields);
    open.activity.push({ by: "Website", type: "system", text: `Updated from resume builder · looking for ${role}` });
    await open.save();
    return { candidateId: open.candidateId, updated: true };
  }
  const candidateId = await nextCandidateId();
  await Candidate.create({
    candidateId,
    email,
    source: "Resume Builder",
    ...fields,
    activity: [{ by: "Website", type: "system", text: `Joined via resume builder · looking for ${role} · resume saved to account` }],
  });
  return { candidateId, updated: false };
}

/** A first draft from the candidate's latest application, so they don't retype what we already have. */
export async function draftFromApplication(email: string): Promise<ResumeData> {
  await connectDB();
  const c = await Candidate.findOne({ email }).sort({ dateApplied: -1 }).lean();
  if (!c) return emptyResume({ email });
  const ed = c.education ?? { tenth: "", twelfth: "", graduate: "", postGraduate: "" };
  const education = [
    ed.postGraduate && { degree: ed.postGraduate, school: "", year: "", score: "" },
    ed.graduate && { degree: ed.graduate, school: "", year: "", score: "" },
    ed.twelfth && { degree: `12th / PUC — ${ed.twelfth}`, school: "", year: "", score: "" },
    ed.tenth && { degree: `10th / SSLC — ${ed.tenth}`, school: "", year: "", score: "" },
  ].filter((e): e is ResumeData["education"][number] => !!e);
  const languages = [...(c.languages ?? []), ...(c.intlLanguages ?? [])]
    .filter((l, i, a) => l && a.indexOf(l) === i)
    .slice(0, 10)
    .map((name) => ({ name, level: LANGUAGE_LEVELS[1] }));
  return emptyResume({
    name: c.name,
    email,
    phone: c.phone,
    headline: c.role ? `Aspiring ${c.role}` : "",
    location: c.area ? `${c.area}, Bengaluru` : "Bengaluru, Karnataka",
    languages,
    experience: c.lastCompany ? [{ role: "", company: c.lastCompany, location: "", start: "", end: "", current: false, points: "" }] : [],
    education: education.length ? education : emptyResume().education,
  });
}
