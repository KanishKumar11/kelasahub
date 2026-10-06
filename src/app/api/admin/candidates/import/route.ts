import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { parseApplicationsWorkbook } from "@/lib/sheet";
import { importRows } from "@/lib/importer";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an .xlsx file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File is larger than 10 MB" }, { status: 400 });
  try {
    const rows = await parseApplicationsWorkbook(Buffer.from(await file.arrayBuffer()));
    if (!rows.length) return NextResponse.json({ error: "No rows found — is this the Applications sheet?" }, { status: 400 });
    await connectDB();
    return NextResponse.json(await importRows(rows, `${s.name} (import)`));
  } catch (e) {
    return NextResponse.json({ error: `Couldn't read that file: ${e instanceof Error ? e.message : e}` }, { status: 400 });
  }
}
