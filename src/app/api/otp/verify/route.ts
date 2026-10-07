import { NextResponse } from "next/server";
import { firstError, otpVerifySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { checkOtp, signEmailToken } from "@/lib/otp";
import { lookupStatus } from "@/lib/status";
import { signInCandidate } from "@/lib/candidate-auth";

// POST { purpose, email, code, candidateId? }
//  apply  → { token }   (sent back with the application)
//  status → the candidate's application status (and signs them in for this browser session)
//  login  → signs the candidate in for 30 days
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
  if (d.purpose === "login") {
    await signInCandidate(d.email, true);
    return NextResponse.json({ ok: true });
  }
  const status = await lookupStatus(d.candidateId, d.email);
  if (!status) return NextResponse.json({ error: "We couldn't find that application." }, { status: 404 });
  await signInCandidate(d.email, false);
  return NextResponse.json({ status });
}
