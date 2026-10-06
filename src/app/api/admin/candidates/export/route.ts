import { connectDB } from "@/lib/db";
import { Candidate } from "@/lib/models";
import { buildCandidateQuery, readFilters } from "@/lib/candidate-query";
import { candidatesToWorkbook } from "@/lib/sheet";
import { guard } from "@/lib/api-auth";

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { query, sort } = buildCandidateQuery(readFilters(sp));
  await connectDB();
  const rows = await Candidate.find(query).sort(sort).populate("partner", "name").select("-activity").lean();
  const wb = await candidatesToWorkbook(rows as never);
  const buf = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="KelasaHub-Applications-${stamp}.xlsx"`,
    },
  });
}
