import { NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { pdfResponse, renderApplications } from "@/lib/pdf/render";
import { applicationFilename, loadApplications } from "@/lib/pdf/applications";

// GET /api/admin/pdf/application?ids=a,b,c → one application form per page
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter((x) => /^[a-f0-9]{24}$/.test(x));
  if (!ids.length) return NextResponse.json({ error: "No candidates selected" }, { status: 400 });
  if (ids.length > 200) return NextResponse.json({ error: "Select at most 200 candidates" }, { status: 400 });

  const data = await loadApplications(ids);
  if (!data.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return pdfResponse(await renderApplications(data), applicationFilename(data));
}
