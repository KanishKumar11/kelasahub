import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models";
import { firstError, leadSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(req, "lead", 5)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }
  const parsed = leadSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const { website, ...lead } = parsed.data;
  if (website) return NextResponse.json({ ok: true });
  await connectDB();
  await Lead.create(lead);
  return NextResponse.json({ ok: true });
}
