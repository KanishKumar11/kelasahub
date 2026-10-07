import { NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { getSavedResume } from "@/lib/resume-store";
import { pdfResponse, renderResume, resumeFilename } from "@/lib/pdf/render";

// GET /api/admin/pdf/resume?email= → the resume a candidate built on the site.
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const email = (new URL(req.url).searchParams.get("email") ?? "").trim().toLowerCase();
  const saved = email ? await getSavedResume(email) : null;
  if (!saved) return NextResponse.json({ error: "No resume found" }, { status: 404 });
  return pdfResponse(await renderResume(saved.data), resumeFilename(saved.data));
}
