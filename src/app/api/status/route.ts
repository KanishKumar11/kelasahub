import { NextResponse } from "next/server";
import { firstError, statusSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { lookupStatus } from "@/lib/status";

export async function POST(req: Request) {
  if (!rateLimit(req, "status", 10)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  const parsed = statusSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const result = await lookupStatus(parsed.data.candidateId, parsed.data.phone);
  if (!result) {
    return NextResponse.json({ error: "We couldn't find an application with that ID and phone number." }, { status: 404 });
  }
  return NextResponse.json(result);
}
