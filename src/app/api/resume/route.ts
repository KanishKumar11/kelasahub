import { NextResponse } from "next/server";
import { getCandidateSession } from "@/lib/candidate-auth";
import { deleteResume, saveResume } from "@/lib/resume-store";
import { resumeSchema } from "@/lib/resume";
import { firstError } from "@/lib/validation";

// PUT the builder's data → saved to the signed-in candidate's account.
export async function PUT(req: Request) {
  const session = await getCandidateSession();
  if (!session) return NextResponse.json({ error: "Please sign in to save your resume." }, { status: 401 });
  const parsed = resumeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  await saveResume(session.email, parsed.data);
  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}

// DELETE → removes the signed-in candidate's saved resume (their copy on this device is cleared by the page).
export async function DELETE() {
  const session = await getCandidateSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  await deleteResume(session.email);
  return NextResponse.json({ ok: true });
}
