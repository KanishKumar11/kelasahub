import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Candidate } from "@/lib/models";
import { guard } from "@/lib/api-auth";
import { pdfResponse, renderApplications } from "@/lib/pdf/render";
import type { ApplicationData } from "@/lib/pdf/ApplicationForm";

// GET /api/admin/pdf/application?ids=a,b,c → one application form per page
export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter((x) => /^[a-f0-9]{24}$/.test(x));
  if (!ids.length) return NextResponse.json({ error: "No candidates selected" }, { status: 400 });
  if (ids.length > 200) return NextResponse.json({ error: "Select at most 200 candidates" }, { status: 400 });

  await connectDB();
  const docs = await Candidate.find({ _id: { $in: ids } })
    .populate<{ partner: { name: string; location: string; address: string } | null }>("partner", "name location address")
    .sort({ dateApplied: 1 })
    .lean();
  if (!docs.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: ApplicationData[] = docs.map((c) => ({
    candidateId: c.candidateId,
    name: c.name,
    phone: c.phone,
    email: c.email ?? "",
    role: c.role ?? "",
    nationality: c.nationality ?? "",
    address: c.address ?? "",
    pincode: c.pincode ?? "",
    area: c.area ?? "",
    languages: c.languages ?? [],
    intlLanguages: c.intlLanguages ?? [],
    employmentStatus: c.employmentStatus ?? "",
    expYears: c.expYears ?? "",
    lastCompany: c.lastCompany ?? "",
    shiftPreference: c.shiftPreference ?? "",
    targetSalary: c.targetSalary ?? "",
    education: c.education ?? {},
    referredBy: c.referredBy ?? "KelasaHub",
    dateApplied: c.dateApplied,
    partner: c.partner,
  }));

  const buf = await renderApplications(data);
  const first = docs[0];
  const name =
    docs.length === 1
      ? `${first.partner?.name ?? "KelasaHub"}_Application_${first.role}_${first.name}_${first.candidateId}.pdf`.replace(/\s+/g, "_")
      : `KelasaHub_Applications_${docs.length}.pdf`;
  return pdfResponse(buf, name);
}
