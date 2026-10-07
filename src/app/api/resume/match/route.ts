import { NextResponse } from "next/server";
import { z } from "zod";
import { getCandidateSession } from "@/lib/candidate-auth";
import { rateLimit } from "@/lib/rate-limit";
import { matchFromResume, saveResume } from "@/lib/resume-store";
import { resumeSchema } from "@/lib/resume";
import { firstError } from "@/lib/validation";

const body = z.object({
  resume: resumeSchema,
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91)(?=\d{10}$)/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number"),
  role: z.string().trim().min(2, "Pick the kind of role you want").max(120),
  jobId: z.string().regex(/^[a-f0-9]{24}$/).nullable().default(null),
  consent: z.literal(true, { error: "Please agree so we can share your profile with employers" }),
});

// POST → saves the resume and adds the signed-in candidate to the hiring pipeline.
export async function POST(req: Request) {
  if (!rateLimit(req, "resume-match", 6)) return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  const session = await getCandidateSession();
  if (!session) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const d = parsed.data;
  if (d.resume.name.trim().length < 2) return NextResponse.json({ error: "Add your full name to the resume first." }, { status: 400 });

  await saveResume(session.email, d.resume);
  const result = await matchFromResume(session.email, d.resume, { phone: d.phone, role: d.role, jobId: d.jobId });
  return NextResponse.json(result);
}
