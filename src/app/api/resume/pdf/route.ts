import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { pdfResponse, renderResume, resumeFilename } from "@/lib/pdf/render";
import { resumeSchema } from "@/lib/resume";
import { firstError } from "@/lib/validation";
import { countResumeDownload } from "@/lib/resume-store";

// POST resume data → PDF. Open to everyone (no account needed); nothing is stored.
export async function POST(req: Request) {
  if (!rateLimit(req, "resume-pdf", 12)) {
    return NextResponse.json({ error: "Too many downloads — try again in a minute." }, { status: 429 });
  }
  const parsed = resumeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const pdf = await renderResume(parsed.data);
  void countResumeDownload().catch(() => {});
  return pdfResponse(pdf, resumeFilename(parsed.data), true);
}
