import { NextResponse } from "next/server";
import { firstError, otpVerifySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { checkOtp, signEmailToken } from "@/lib/otp";
import { lookupStatus } from "@/lib/status";

// POST { purpose, email, code, candidateId? }
//  apply  → { token }   (sent back with the application)
//  status → the candidate's application status
export async function POST(req: Request) {
  if (!rateLimit(req, "otp-verify", 15)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  const parsed = otpVerifySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const d = parsed.data;

  const ok = await checkOtp(d.email, d.purpose, d.code);
  if (!ok.ok) return NextResponse.json({ error: ok.error }, { status: 400 });

  if (d.purpose === "apply") {
    return NextResponse.json({ token: await signEmailToken(d.email, "apply") });
  }
  const status = await lookupStatus(d.candidateId, d.email);
  if (!status) return NextResponse.json({ error: "We couldn't find that application." }, { status: 404 });
  return NextResponse.json({ status });
}
